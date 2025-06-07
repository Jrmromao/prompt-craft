import { Role } from '@/utils/constants';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@/utils/constants';

export type AIModel = 'deepseek' | 'gpt4' | 'claude';

interface GenerateOptions {
  prompt: string;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

interface RunPromptOptions {
  promptId: string;
  input: string;
  model?: AIModel;
  temperature?: number;
  userId?: string;
}

export class AIService {
  private static instance: AIService;
  private readonly DEEPSEEK_API_KEY: string;
  private readonly OPENAI_API_KEY: string;
  private readonly ANTHROPIC_API_KEY: string;

  private constructor() {
    this.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    this.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async getUserRole(userId: string): Promise<Role> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return (user?.role as Role) || Role.USER;
  }

  private async getUserPlanType(userId: string): Promise<PlanType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });
    return (user?.planType as PlanType) || PlanType.FREE;
  }

  private async validateModelAccess(userId: string, model: AIModel): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    if (!user) return false;

    const modelAccess: Record<PlanType, AIModel[]> = {
      [PlanType.FREE]: ['deepseek'],
      [PlanType.LITE]: ['deepseek', 'gpt4'],
      [PlanType.PRO]: ['deepseek', 'gpt4', 'claude'],
    };

    return modelAccess[user.planType as PlanType].includes(model);
  }

  public async generateText(options: GenerateOptions): Promise<string> {
    const model = options.model || 'deepseek';

    // Validate model access if userId is provided
    if (options.userId) {
      const hasAccess = await this.validateModelAccess(options.userId, model);
      if (!hasAccess) {
        throw new Error(
          'You do not have access to this model. Please upgrade to Pro for advanced models.'
        );
      }
    }

    // Generate text based on the model
    switch (model) {
      case 'deepseek':
        return this.generateWithDeepseek(options);
      case 'gpt4':
        return this.generateWithGPT4(options);
      case 'claude':
        return this.generateWithClaude(options);
      default:
        throw new Error('Invalid model specified');
    }
  }

  public async runPrompt(options: RunPromptOptions): Promise<{ text: string }> {
    // Get the prompt from the database
    const prompt = await prisma.prompt.findUnique({
      where: { id: options.promptId },
      select: { content: true, userId: true },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Combine the prompt template with the user input
    const fullPrompt = prompt.content.replace('{input}', options.input);

    // Generate the response
    const text = await this.generateText({
      prompt: fullPrompt,
      model: options.model,
      temperature: options.temperature,
      userId: options.userId,
    });

    return { text };
  }

  private async generateWithDeepseek(options: GenerateOptions): Promise<string> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: options.prompt }],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to generate text with Deepseek: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Deepseek API');
      }
      return data.choices[0].message.content;
    } catch (error: any) {
      if (error.message.includes('Failed to generate text')) {
        throw error;
      }
      throw new Error(`Deepseek API error: ${error.message}`);
    }
  }

  private async generateWithGPT4(options: GenerateOptions): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: options.prompt }],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to generate text with GPT-4: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API');
      }
      return data.choices[0].message.content;
    } catch (error: any) {
      if (error.message.includes('Failed to generate text')) {
        throw error;
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  private async generateWithClaude(options: GenerateOptions): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: options.prompt }],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to generate text with Claude: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.content?.[0]?.text) {
        throw new Error('Invalid response format from Claude API');
      }
      return data.content[0].text;
    } catch (error: any) {
      if (error.message.includes('Failed to generate text')) {
        throw error;
      }
      throw new Error(`Claude API error: ${error.message}`);
    }
  }
}
