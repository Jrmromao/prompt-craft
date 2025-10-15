import Anthropic from '@anthropic-ai/sdk';
import { CostCalculator } from './costCalculator';
import { prisma } from '@/lib/prisma';

export interface AnthropicRunResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  model: string;
}

export class AnthropicService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async run(
    userId: string,
    promptId: string | null,
    input: string,
    model: string = 'claude-3-sonnet-20240229',
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<AnthropicRunResult> {
    const startTime = Date.now();

    const message = await this.client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 500,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: 'user', content: input }],
    });

    const latency = Date.now() - startTime;
    const output = message.content[0].type === 'text' ? message.content[0].text : '';
    
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;

    const cost = CostCalculator.calculateCost(model, inputTokens, outputTokens);

    // Track in database
    await prisma.promptRun.create({
      data: {
        userId,
        promptId,
        model,
        inputText: input,
        outputText: output,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        latency,
      },
    });

    return {
      output,
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
      latency,
      model,
    };
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
}
