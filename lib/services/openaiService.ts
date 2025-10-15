import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
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
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: input }],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2048,
      });

      const latency = Date.now() - start;
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = this.calculateCost(model, tokensUsed);

      await prisma.promptRun.create({
        data: {
          userId,
          promptId,
          provider: 'openai',
          model,
          input,
          output: response.choices[0]?.message?.content || '',
          tokensUsed,
          totalTokens: tokensUsed,
          cost,
          latency,
          success: true,
        },
      });

      return {
        output: response.choices[0]?.message?.content,
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
          provider: 'openai',
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
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.0005,
    };
    const rate = pricing[model] || 0.001;
    return (tokens / 1000) * rate;
  }
}
