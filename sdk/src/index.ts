import type OpenAI from 'openai';
import type Anthropic from '@anthropic-ai/sdk';

interface PromptCraftConfig {
  apiKey: string;
  baseUrl?: string;
  enableCache?: boolean;
  maxRetries?: number;
  middleware?: Middleware[];
}

interface TrackRunData {
  provider: string;
  promptId?: string;
  model: string;
  input: string;
  output: string;
  tokensUsed: number;
  latency: number;
  success: boolean;
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
      ...config,
    };
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
          async create(params: any, options?: { promptId?: string; cacheTTL?: number }) {
            // Check cache
            if (self.config.enableCache) {
              const cacheKey = self.getCacheKey('openai', params);
              const cached = self.getFromCache(cacheKey);
              if (cached) return cached;
            }

            // Run before middleware
            params = await self.runMiddleware('before', params);

            const start = Date.now();
            try {
              const result = await self.retryWithBackoff(async () => {
                return await client.chat.completions.create(params);
              });

              // Run after middleware
              const processedResult = await self.runMiddleware('after', result);

              // Cache result
              if (self.config.enableCache && options?.cacheTTL) {
                const cacheKey = self.getCacheKey('openai', params);
                self.setCache(cacheKey, processedResult, options.cacheTTL);
              }

              // Track
              await self.trackOpenAI(params, processedResult, Date.now() - start, options?.promptId);
              
              return processedResult;
            } catch (error) {
              await self.runMiddleware('onError', error);
              await self.trackError('openai', params.model, JSON.stringify(params.messages), error as Error, Date.now() - start);
              throw error;
            }
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
        async create(params: any, options?: { promptId?: string; cacheTTL?: number }) {
          if (self.config.enableCache) {
            const cacheKey = self.getCacheKey('anthropic', params);
            const cached = self.getFromCache(cacheKey);
            if (cached) return cached;
          }

          params = await self.runMiddleware('before', params);

          const start = Date.now();
          try {
            const result = await self.retryWithBackoff(async () => {
              return await client.messages.create(params);
            });

            const processedResult = await self.runMiddleware('after', result);

            if (self.config.enableCache && options?.cacheTTL) {
              const cacheKey = self.getCacheKey('anthropic', params);
              self.setCache(cacheKey, processedResult, options.cacheTTL);
            }

            await self.trackAnthropic(params, processedResult, Date.now() - start, options?.promptId);
            
            return processedResult;
          } catch (error) {
            await self.runMiddleware('onError', error);
            await self.trackError('anthropic', params.model, JSON.stringify(params.messages), error as Error, Date.now() - start);
            throw error;
          }
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
