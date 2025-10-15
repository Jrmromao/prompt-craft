import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

export class AnthropicService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  async run(
    userId: string,
    promptId: string,
    input: string,
    model: string,
    options?: { temperature?: number; maxTokens?: number }
  ) {
    const start = Date.now();
    
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: options?.maxTokens || 2048,
        messages: [{ role: 'user', content: input }],
      });

      const latency = Date.now() - start;
      const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
      const cost = this.calculateCost(model, tokensUsed);

      await prisma.promptRun.create({
        data: {
          userId,
          promptId,
          provider: 'anthropic',
          model,
          input,
          output: response.content[0]?.type === 'text' ? response.content[0].text : '',
          tokensUsed,
          totalTokens: tokensUsed,
          cost,
          latency,
          success: true,
        },
      });

      return {
        output: response.content[0]?.type === 'text' ? response.content[0].text : '',
        tokensUsed,
        cost,
        latency,
      };
    } catch (error: any) {
      const latency = Date.now() - start;
      
      await prisma.promptRun.create({
        data: {
          userId,
          promptId,
          provider: 'anthropic',
          model,
          input,
          output: '',
          tokensUsed: 0,
          totalTokens: 0,
          cost: 0,
          latency,
          success: false,
          error: error.message,
        },
      });

      throw error;
    }
  }

  private calculateCost(model: string, tokens: number): number {
    const pricing: Record<string, number> = {
      'claude-3-opus-20240229': 0.015,
      'claude-3-sonnet-20240229': 0.003,
      'claude-3-haiku-20240307': 0.00025,
    };
    const rate = pricing[model] || 0.001;
    return (tokens / 1000) * rate;
  }
}
