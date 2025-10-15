import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface PromptCraftConfig {
  apiKey: string;
  baseUrl?: string;
}

export class PromptCraft {
  private config: PromptCraftConfig;

  constructor(config: PromptCraftConfig) {
    this.config = {
      baseUrl: 'https://promptcraft.app',
      ...config,
    };
  }

  async trackRun(data: {
    promptId: string;
    model: string;
    input: string;
    output: string;
    tokensUsed: number;
    latency: number;
    success: boolean;
    error?: string;
  }) {
    const response = await fetch(`${this.config.baseUrl}/api/integrations/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to track run: ${response.statusText}`);
    }

    return response.json();
  }

  wrapOpenAI(client: OpenAI) {
    const original = client.chat.completions.create.bind(client.chat.completions);
    
    client.chat.completions.create = async (params: any) => {
      const start = Date.now();
      try {
        const result = await original(params);
        const latency = Date.now() - start;
        
        await this.trackRun({
          promptId: params.promptId || 'unknown',
          model: params.model,
          input: JSON.stringify(params.messages),
          output: result.choices[0]?.message?.content || '',
          tokensUsed: result.usage?.total_tokens || 0,
          latency,
          success: true,
        });

        return result;
      } catch (error: any) {
        const latency = Date.now() - start;
        await this.trackRun({
          promptId: params.promptId || 'unknown',
          model: params.model,
          input: JSON.stringify(params.messages),
          output: '',
          tokensUsed: 0,
          latency,
          success: false,
          error: error.message,
        });
        throw error;
      }
    };

    return client;
  }

  wrapAnthropic(client: Anthropic) {
    const original = client.messages.create.bind(client.messages);
    
    client.messages.create = async (params: any) => {
      const start = Date.now();
      try {
        const result = await original(params);
        const latency = Date.now() - start;
        
        await this.trackRun({
          promptId: params.promptId || 'unknown',
          model: params.model,
          input: JSON.stringify(params.messages),
          output: result.content[0]?.text || '',
          tokensUsed: result.usage?.input_tokens + result.usage?.output_tokens || 0,
          latency,
          success: true,
        });

        return result;
      } catch (error: any) {
        const latency = Date.now() - start;
        await this.trackRun({
          promptId: params.promptId || 'unknown',
          model: params.model,
          input: JSON.stringify(params.messages),
          output: '',
          tokensUsed: 0,
          latency,
          success: false,
          error: error.message,
        });
        throw error;
      }
    };

    return client;
  }
}
