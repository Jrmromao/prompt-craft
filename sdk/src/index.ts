import type OpenAI from 'openai';
import type Anthropic from '@anthropic-ai/sdk';

interface PromptCraftConfig {
  apiKey: string;
  baseUrl?: string;
}

interface TrackRunData {
  promptId?: string;
  model: string;
  input: string;
  output: string;
  tokensUsed: number;
  latency: number;
  success: boolean;
  error?: string;
}

export class PromptCraft {
  private config: PromptCraftConfig;

  constructor(config: PromptCraftConfig) {
    this.config = {
      baseUrl: 'https://promptcraft.app',
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

  async trackOpenAI(
    params: OpenAI.Chat.ChatCompletionCreateParams,
    result: OpenAI.Chat.ChatCompletion,
    latency: number
  ): Promise<void> {
    await this.trackRun({
      promptId: (params as any).promptId,
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
    latency: number
  ): Promise<void> {
    await this.trackRun({
      promptId: (params as any).promptId,
      model: params.model,
      input: JSON.stringify(params.messages),
      output: result.content[0]?.type === 'text' ? result.content[0].text : '',
      tokensUsed: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
      latency,
      success: true,
    });
  }

  async trackError(
    model: string,
    input: string,
    error: Error,
    latency: number
  ): Promise<void> {
    await this.trackRun({
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
