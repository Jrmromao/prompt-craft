import OpenAI from 'openai';
import { CostCalculator } from './costCalculator';
import { prisma } from '@/lib/prisma';

export interface OpenAIRunResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  model: string;
}

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async run(
    userId: string,
    promptId: string | null,
    input: string,
    model: string = 'gpt-3.5-turbo',
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<OpenAIRunResult> {
    const startTime = Date.now();

    const completion = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: input }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 500,
    });

    const latency = Date.now() - startTime;
    const usage = completion.usage!;
    const output = completion.choices[0].message.content || '';

    const cost = CostCalculator.calculateCost(
      model,
      usage.prompt_tokens,
      usage.completion_tokens
    );

    // Track in database
    await prisma.promptRun.create({
      data: {
        userId,
        promptId,
        model,
        inputText: input,
        outputText: output,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        cost,
        latency,
      },
    });

    return {
      output,
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cost,
      latency,
      model,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
