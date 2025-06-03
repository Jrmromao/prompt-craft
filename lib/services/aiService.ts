import { Role } from '@/utils/constants';
import { prisma } from '@/lib/prisma';

export type AIModel = 'deepseek' | 'gpt4' | 'claude';

interface GenerateOptions {
  prompt: string;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
}

export class AIService {
  private static instance: AIService;
  private readonly DEEPSEEK_API_KEY: string;
  private readonly OPENAI_API_KEY: string;
  private readonly ANTHROPIC_API_KEY: string;

  private constructor() {
    this.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
    this.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
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
    return (user?.role as Role) || Role.FREE;
  }

  private async validateModelAccess(userId: string, model: AIModel): Promise<boolean> {
    const role = await this.getUserRole(userId);
    
    // Free and Lite users can only use deepseek
    if (role === Role.FREE || role === Role.LITE) {
      return model === 'deepseek';
    }
    
    // Pro users can use all models
    return role === Role.PRO;
  }

  public async generateText(userId: string, options: GenerateOptions): Promise<string> {
    const model = options.model || 'deepseek';
    
    // Validate model access
    const hasAccess = await this.validateModelAccess(userId, model);
    if (!hasAccess) {
      throw new Error('You do not have access to this model. Please upgrade to Pro for advanced models.');
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

  private async generateWithDeepseek(options: GenerateOptions): Promise<string> {
    // Implement Deepseek API call
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: options.prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate text with Deepseek');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateWithGPT4(options: GenerateOptions): Promise<string> {
    // Implement GPT-4 API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: options.prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate text with GPT-4');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateWithClaude(options: GenerateOptions): Promise<string> {
    // Implement Claude API call
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
      throw new Error('Failed to generate text with Claude');
    }

    const data = await response.json();
    return data.content[0].text;
  }
} 