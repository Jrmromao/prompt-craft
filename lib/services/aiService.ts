import { Role } from '@/utils/constants';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@/utils/constants';
import { ServiceError } from './types';

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
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    } = {}
  ): Promise<GenerationResult> {
    try {
      const model = options.model || 'deepseek';
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 2000;
      const topP = options.topP || 1;
      const frequencyPenalty = options.frequencyPenalty || 0;
      const presencePenalty = options.presencePenalty || 0;

      switch (model) {
        case 'deepseek':
          return this.generateWithDeepseek(prompt, temperature, maxTokens, topP, frequencyPenalty, presencePenalty);
        case 'gpt4':
          return this.generateWithGPT4(prompt, temperature, maxTokens, topP, frequencyPenalty, presencePenalty);
        case 'claude':
          return this.generateWithClaude(prompt, temperature, maxTokens, topP, frequencyPenalty, presencePenalty);
        default:
          throw new ServiceError(`Unsupported model: ${model}`, 'UNSUPPORTED_MODEL', 400);
      }
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to generate text', 'AI_GENERATION_FAILED', 500);
    }
  }

  public async runPrompt(options: RunPromptOptions): Promise<{ text: string; tokensUsed: number; creditsDeducted: number }> {
    if (!options.userId) {
      throw new Error('User ID required');
    }

    // Validate model access
    const hasAccess = await this.validateModelAccess(options.userId, options.model || 'deepseek');
    if (!hasAccess) {
      throw new Error('Model access denied for current plan');
    }

    // Get the prompt from the database
    const prompt = await prisma.prompt.findUnique({
      where: { id: options.promptId },
      select: { content: true, userId: true },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Estimate credits needed (rough estimate: 1 credit per 100 tokens)
    const estimatedTokens = Math.ceil(prompt.content.length / 4) + Math.ceil(options.input.length / 4) + 500; // Add buffer for response
    const estimatedCredits = Math.ceil(estimatedTokens / 100);

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { clerkId: options.userId },
      select: {
        id: true,
        monthlyCredits: true,
        purchasedCredits: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const totalCredits = user.monthlyCredits + user.purchasedCredits;
    if (totalCredits < estimatedCredits) {
      throw new Error('Insufficient credits');
    }

    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // Combine the prompt template with the user input
      const fullPrompt = prompt.content.replace('{input}', options.input);

      // Generate the response
      const result = await this.generateText(fullPrompt, {
        model: options.model,
        temperature: options.temperature,
      });

      // Calculate actual credits used based on tokens
      const actualCredits = Math.ceil(result.tokenCount / 100);

      // Deduct credits from user
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: {
          monthlyCredits: true,
          purchasedCredits: true,
        }
      });

      if (!currentUser) {
        throw new Error('User not found during transaction');
      }

      // Deduct from purchased credits first, then monthly
      let remainingToDeduct = actualCredits;
      let newPurchasedCredits = currentUser.purchasedCredits;
      let newMonthlyCredits = currentUser.monthlyCredits;

      if (currentUser.purchasedCredits >= remainingToDeduct) {
        newPurchasedCredits -= remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= currentUser.purchasedCredits;
        newPurchasedCredits = 0;
        newMonthlyCredits -= remainingToDeduct;
      }

      // Update user credits
      await tx.user.update({
        where: { id: user.id },
        data: {
          monthlyCredits: newMonthlyCredits,
          purchasedCredits: newPurchasedCredits,
        }
      });

      // Log the transaction
      await tx.creditHistory.create({
        data: {
          userId: user.id,
          amount: -actualCredits,
          type: 'USAGE',
          description: `AI Generation - ${options.model || 'deepseek'} - ${result.tokenCount} tokens`,
        }
      });

      return {
        text: result.text,
        tokensUsed: result.tokenCount,
        creditsDeducted: actualCredits
      };
    });
  }

  private async generateWithDeepseek(
    prompt: string,
    temperature: number,
    maxTokens: number,
    topP: number,
    frequencyPenalty: number,
    presencePenalty: number
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
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
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
    maxTokens: number,
    topP: number,
    frequencyPenalty: number,
    presencePenalty: number
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
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
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
    maxTokens: number,
    topP: number,
    frequencyPenalty: number,
    presencePenalty: number
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
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
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
