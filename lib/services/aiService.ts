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
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface RunPromptOptions {
  promptId: string;
  input: string;
  model?: AIModel;
  temperature?: number;
  userId?: string;
}

interface GenerationResult {
  text: string;
  tokenCount: number;
  model: string;
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

  public async generateText(
    prompt: string,
    options: {
      model?: 'deepseek' | 'gpt4' | 'claude';
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<GenerationResult> {
    const model = options.model || 'deepseek';
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 2000;

    switch (model) {
      case 'deepseek':
        return this.generateWithDeepseek(prompt, temperature, maxTokens);
      case 'gpt4':
        return this.generateWithGPT4(prompt, temperature, maxTokens);
      case 'claude':
        return this.generateWithClaude(prompt, temperature, maxTokens);
      default:
        throw new Error(`Unsupported model: ${model}`);
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
    const text = await this.generateText(fullPrompt, {
      model: options.model,
      temperature: options.temperature,
      userId: options.userId,
    });

    return { text: text.text };
  }

  private async generateWithDeepseek(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<GenerationResult> {
    if (!this.DEEPSEEK_API_KEY) {
      throw new Error('Deepseek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      tokenCount: data.usage.total_tokens,
      model: 'deepseek-chat',
    };
  }

  private async generateWithGPT4(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<GenerationResult> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      tokenCount: data.usage.total_tokens,
      model: 'gpt-4',
    };
  }

  private async generateWithClaude(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<GenerationResult> {
    if (!this.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text,
      tokenCount: data.usage.input_tokens + data.usage.output_tokens,
      model: 'claude-3-opus-20240229',
    };
  }
}
