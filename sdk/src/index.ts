import type OpenAI from 'openai';
import type Anthropic from '@anthropic-ai/sdk';
import { SmartCall } from './smartCall';

interface PromptCraftConfig {
  apiKey: string;
  baseUrl?: string;
  enableCache?: boolean;
  maxRetries?: number;
  middleware?: Middleware[];
  autoFallback?: boolean;
  smartRouting?: boolean;
  costLimit?: number;
}

interface WrapperOptions {
  promptId?: string;
  cacheTTL?: number;
  fallbackModels?: string[];
  maxCost?: number;
}

interface TrackRunData {
  provider: string;
  promptId?: string;
  model: string;
  requestedModel?: string;
  input: string;
  output: string;
  tokensUsed: number;
  inputTokens?: number;
  outputTokens?: number;
  latency: number;
  success: boolean;
  savings?: number;
  error?: string;
}

interface Middleware {
  before?: (params: any) => Promise<any>;
  after?: (result: any) => Promise<any>;
  onError?: (error: Error) => Promise<void>;
}

interface CacheEntry {
  result: any;
  timestamp: number;
  ttl: number;
}

export class PromptCraft {
  private config: PromptCraftConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private rateLimitQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(config: PromptCraftConfig) {
    this.config = {
      baseUrl: 'https://promptcraft.app',
      enableCache: false,
      maxRetries: 3,
      middleware: [],
      autoFallback: false,
      smartRouting: true,  // ON by default
      ...config,
    };
  }

  private estimateComplexity(messages: any[]): 'simple' | 'medium' | 'complex' {
    const totalLength = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const hasSystemPrompt = messages.some(m => m.role === 'system');
    const messageCount = messages.length;

    if (totalLength < 100 && !hasSystemPrompt && messageCount <= 2) return 'simple';
    if (totalLength < 500 && messageCount <= 5) return 'medium';
    return 'complex';
  }

  private selectOptimalModel(requestedModel: string, messages: any[]): string {
    if (!this.config.smartRouting) return requestedModel;

    const complexity = this.estimateComplexity(messages);

    // Smart routing rules
    if (requestedModel.includes('gpt-4') && complexity === 'simple') {
      return 'gpt-3.5-turbo'; // 60x cheaper
    }
    if (requestedModel.includes('claude-3-opus') && complexity === 'simple') {
      return 'claude-3-haiku'; // 60x cheaper
    }
    if (requestedModel.includes('claude-3-opus') && complexity === 'medium') {
      return 'claude-3-sonnet'; // 5x cheaper
    }

    return requestedModel;
  }

  private getDefaultFallbacks(model: string): string[] {
    const fallbacks: Record<string, string[]> = {
      'gpt-4': ['gpt-4-turbo', 'gpt-3.5-turbo'],
      'gpt-4-turbo': ['gpt-3.5-turbo'],
      'claude-3-opus': ['claude-3-sonnet', 'claude-3-haiku'],
      'claude-3-sonnet': ['claude-3-haiku'],
      'gemini-1.5-pro': ['gemini-1.5-flash'],
    };

    for (const [key, value] of Object.entries(fallbacks)) {
      if (model.includes(key)) return value;
    }

    return [];
  }

  private estimateCost(model: string, messages: any[]): number {
    const estimatedTokens = messages.reduce((sum, m) => sum + (m.content?.length || 0) / 4, 0) * 1.5;
    
    const pricing: Record<string, number> = {
      'gpt-4': 0.045,
      'gpt-4-turbo': 0.02,
      'gpt-3.5-turbo': 0.001,
      'claude-3-opus': 0.045,
      'claude-3-sonnet': 0.009,
      'claude-3-haiku': 0.000875,
      'gemini-1.5-pro': 0.003125,
      'gemini-1.5-flash': 0.0001875,
    };

    const rate = Object.entries(pricing).find(([key]) => model.includes(key))?.[1] || 0.01;
    return (estimatedTokens / 1000) * rate;
  }

  private async trackRun(data: TrackRunData): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/integrations/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('PromptCraft tracking failed:', response.statusText);
      }
    } catch (error) {
      console.error('PromptCraft tracking error:', error);
    }
  }

  private getCacheKey(provider: string, params: any): string {
    return `${provider}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  private setCache(key: string, result: any, ttl: number = 3600000): void {
    this.cache.set(key, { result, timestamp: Date.now(), ttl });
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          throw error;
        }
        
        // Last attempt - throw error
        if (i === retries - 1) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw lastError;
  }

  private async runMiddleware(type: 'before' | 'after' | 'onError', data: any): Promise<any> {
    let result = data;
    for (const mw of this.config.middleware || []) {
      if (mw[type]) {
        result = await mw[type]!(result);
      }
    }
    return result;
  }

  // Wrapper: Auto-track OpenAI calls with advanced features
  wrapOpenAI(client: any) {
    const self = this;
    return {
      chat: {
        completions: {
          async create(params: any, options?: WrapperOptions) {
            // Smart routing - select optimal model
            const originalModel = params.model;
            if (self.config.smartRouting) {
              params.model = self.selectOptimalModel(params.model, params.messages);
              if (params.model !== originalModel) {
                console.log(`[PromptCraft] Smart routing: ${originalModel} → ${params.model}`);
              }
            }

            // Cost limit check
            if (options?.maxCost || self.config.costLimit) {
              const estimatedCost = self.estimateCost(params.model, params.messages);
              const limit = options?.maxCost || self.config.costLimit || Infinity;
              if (estimatedCost > limit) {
                throw new Error(`Estimated cost $${estimatedCost.toFixed(4)} exceeds limit $${limit}`);
              }
            }

            // Check cache
            if (self.config.enableCache) {
              const cacheKey = self.getCacheKey('openai', params);
              const cached = self.getFromCache(cacheKey);
              if (cached) {
                console.log('[PromptCraft] Cache hit - $0 cost!');
                return cached;
              }
            }

            // Run before middleware
            params = await self.runMiddleware('before', params);

            const start = Date.now();
            const fallbackModels = options?.fallbackModels || 
              (self.config.autoFallback ? self.getDefaultFallbacks(params.model) : []);

            // Try main model + fallbacks
            const modelsToTry = [params.model, ...fallbackModels];
            let lastError: any;

            for (let i = 0; i < modelsToTry.length; i++) {
              const currentModel = modelsToTry[i];
              const isOriginal = i === 0;

              try {
                const result = await self.retryWithBackoff(async () => {
                  return await client.chat.completions.create({
                    ...params,
                    model: currentModel,
                  });
                });

                // Run after middleware
                const processedResult = await self.runMiddleware('after', result);

                // Cache result
                if (self.config.enableCache && options?.cacheTTL) {
                  const cacheKey = self.getCacheKey('openai', params);
                  self.setCache(cacheKey, processedResult, options.cacheTTL);
                }

                // Track with fallback info
                const inputTokens = processedResult.usage?.prompt_tokens || 0;
                const outputTokens = processedResult.usage?.completion_tokens || 0;
                
                // Calculate savings if we routed to cheaper model
                let savings = 0;
                if (originalModel !== currentModel) {
                  const requestedCost = self.estimateCost(originalModel, params.messages);
                  const actualCost = self.estimateCost(currentModel, params.messages);
                  savings = requestedCost - actualCost;
                }
                
                await self.trackRun({
                  provider: 'openai',
                  promptId: options?.promptId,
                  model: currentModel,
                  requestedModel: originalModel,
                  input: JSON.stringify(params.messages),
                  output: processedResult.choices[0]?.message?.content || '',
                  tokensUsed: processedResult.usage?.total_tokens || 0,
                  inputTokens,
                  outputTokens,
                  latency: Date.now() - start,
                  success: true,
                  savings,
                });

                if (!isOriginal) {
                  console.log(`[PromptCraft] Fallback success: ${originalModel} → ${currentModel}`);
                }

                return processedResult;
              } catch (error) {
                lastError = error;
                
                // If this is the last model, throw
                if (i === modelsToTry.length - 1) {
                  await self.runMiddleware('onError', error);
                  await self.trackError('openai', currentModel, JSON.stringify(params.messages), error as Error, Date.now() - start);
                  throw error;
                }

                // Otherwise, try next fallback
                console.log(`[PromptCraft] Fallback: ${currentModel} failed, trying ${modelsToTry[i + 1]}...`);
              }
            }

            throw lastError;
          },

          // Streaming support
          async stream(params: any, options?: { promptId?: string }) {
            const start = Date.now();
            let fullContent = '';
            let tokensUsed = 0;

            try {
              const stream = await client.chat.completions.create({
                ...params,
                stream: true,
              });

              // Wrap the stream to collect data
              const wrappedStream = {
                async *[Symbol.asyncIterator]() {
                  for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    fullContent += content;
                    yield chunk;
                  }

                  // Track after stream completes
                  await self.trackRun({
                    provider: 'openai',
                    promptId: options?.promptId,
                    model: params.model,
                    input: JSON.stringify(params.messages),
                    output: fullContent,
                    tokensUsed: Math.ceil(fullContent.length / 4), // Rough estimate
                    latency: Date.now() - start,
                    success: true,
                  });
                }
              };

              return wrappedStream;
            } catch (error) {
              await self.trackError('openai', params.model, JSON.stringify(params.messages), error as Error, Date.now() - start);
              throw error;
            }
          }
        }
      }
    };
  }

  // Wrapper: Auto-track Anthropic calls
  wrapAnthropic(client: any) {
    const self = this;
    return {
      messages: {
        async create(params: any, options?: WrapperOptions) {
          const originalModel = params.model;
          if (self.config.smartRouting) {
            params.model = self.selectOptimalModel(params.model, params.messages);
            if (params.model !== originalModel) {
              console.log(`[PromptCraft] Smart routing: ${originalModel} → ${params.model}`);
            }
          }

          if (options?.maxCost || self.config.costLimit) {
            const estimatedCost = self.estimateCost(params.model, params.messages);
            const limit = options?.maxCost || self.config.costLimit || Infinity;
            if (estimatedCost > limit) {
              throw new Error(`Estimated cost $${estimatedCost.toFixed(4)} exceeds limit $${limit}`);
            }
          }

          if (self.config.enableCache) {
            const cacheKey = self.getCacheKey('anthropic', params);
            const cached = self.getFromCache(cacheKey);
            if (cached) {
              console.log('[PromptCraft] Cache hit - $0 cost!');
              return cached;
            }
          }

          params = await self.runMiddleware('before', params);

          const start = Date.now();
          const fallbackModels = options?.fallbackModels || 
            (self.config.autoFallback ? self.getDefaultFallbacks(params.model) : []);

          const modelsToTry = [params.model, ...fallbackModels];
          let lastError: any;

          for (let i = 0; i < modelsToTry.length; i++) {
            const currentModel = modelsToTry[i];
            const isOriginal = i === 0;

            try {
              const result = await self.retryWithBackoff(async () => {
                return await client.messages.create({
                  ...params,
                  model: currentModel,
                });
              });

              const processedResult = await self.runMiddleware('after', result);

              if (self.config.enableCache && options?.cacheTTL) {
                const cacheKey = self.getCacheKey('anthropic', params);
                self.setCache(cacheKey, processedResult, options.cacheTTL);
              }

              await self.trackRun({
                provider: 'anthropic',
                promptId: options?.promptId,
                model: currentModel,
                input: JSON.stringify(params.messages),
                output: processedResult.content[0]?.type === 'text' ? processedResult.content[0].text : '',
                tokensUsed: (processedResult.usage?.input_tokens || 0) + (processedResult.usage?.output_tokens || 0),
                latency: Date.now() - start,
                success: true,
              });

              if (!isOriginal) {
                console.log(`[PromptCraft] Fallback success: ${originalModel} → ${currentModel}`);
              }

              return processedResult;
            } catch (error) {
              lastError = error;
              
              if (i === modelsToTry.length - 1) {
                await self.runMiddleware('onError', error);
                await self.trackError('anthropic', currentModel, JSON.stringify(params.messages), error as Error, Date.now() - start);
                throw error;
              }

              console.log(`[PromptCraft] Fallback: ${currentModel} failed, trying ${modelsToTry[i + 1]}...`);
            }
          }

          throw lastError;
        }
      }
    };
  }

  // Batch tracking for multiple calls
  async trackBatch(calls: Array<{ provider: string; model: string; tokens: number; latency: number }>) {
    const promises = calls.map(call => 
      this.trackRun({
        provider: call.provider,
        model: call.model,
        input: '',
        output: '',
        tokensUsed: call.tokens,
        latency: call.latency,
        success: true,
      })
    );
    await Promise.all(promises);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Smart Call: Automatically select cheapest model meeting quality threshold
  smartCall(client: any) {
    return new SmartCall(client, this.config.apiKey);
  }

  async trackOpenAI(
    params: OpenAI.Chat.ChatCompletionCreateParams,
    result: OpenAI.Chat.ChatCompletion,
    latency: number,
    promptId?: string
  ): Promise<void> {
    await this.trackRun({
      provider: 'openai',
      promptId,
      model: params.model,
      input: JSON.stringify(params.messages),
      output: result.choices[0]?.message?.content || '',
      tokensUsed: result.usage?.total_tokens || 0,
      latency,
      success: true,
    });
  }

  async trackAnthropic(
    params: Anthropic.MessageCreateParams,
    result: Anthropic.Message,
    latency: number,
    promptId?: string
  ): Promise<void> {
    await this.trackRun({
      provider: 'anthropic',
      promptId,
      model: params.model,
      input: JSON.stringify(params.messages),
      output: result.content[0]?.type === 'text' ? result.content[0].text : '',
      tokensUsed: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
      latency,
      success: true,
    });
  }

  async trackGemini(
    params: any,
    result: any,
    latency: number,
    promptId?: string
  ): Promise<void> {
    await this.trackRun({
      provider: 'gemini',
      promptId,
      model: params.model || 'gemini-pro',
      input: JSON.stringify(params.contents || params.prompt),
      output: result.candidates?.[0]?.content?.parts?.[0]?.text || '',
      tokensUsed: result.usageMetadata?.totalTokenCount || 0,
      latency,
      success: true,
    });
  }

  async trackGrok(
    params: any,
    result: any,
    latency: number,
    promptId?: string
  ): Promise<void> {
    await this.trackRun({
      provider: 'grok',
      promptId,
      model: params.model || 'grok-beta',
      input: JSON.stringify(params.messages),
      output: result.choices?.[0]?.message?.content || '',
      tokensUsed: result.usage?.total_tokens || 0,
      latency,
      success: true,
    });
  }

  async trackError(
    provider: string,
    model: string,
    input: string,
    error: Error,
    latency: number
  ): Promise<void> {
    await this.trackRun({
      provider,
      model,
      input,
      output: '',
      tokensUsed: 0,
      latency,
      success: false,
      error: error.message,
    });
  }
}

export default PromptCraft;
