import { AIService } from './aiService';
import { CreditService } from './creditService';
import { prisma } from '@/lib/prisma';

interface OptimizationRequest {
  userIdea: string;
  requirements?: string;
  targetAudience?: string;
  promptType?: 'creative' | 'analytical' | 'conversational' | 'technical';
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative';
  userId: string;
}

interface OptimizationResult {
  optimizedPrompt: string;
  suggestions: string[];
  improvements: string[];
  tokensUsed: number;
  creditsConsumed: number;
}

export class PromptOptimizationService {
  private static instance: PromptOptimizationService;
  private aiService: AIService;
  private creditService: CreditService;

  private constructor() {
    this.aiService = AIService.getInstance();
    this.creditService = CreditService.getInstance();
  }

  public static getInstance(): PromptOptimizationService {
    if (!PromptOptimizationService.instance) {
      PromptOptimizationService.instance = new PromptOptimizationService();
    }
    return PromptOptimizationService.instance;
  }

  public async optimizePrompt(request: OptimizationRequest): Promise<OptimizationResult> {
    // Check credits first
    const requiredCredits = 5; // Optimization costs 5 credits
    const creditCheck = await this.creditService.checkCreditBalance(request.userId, requiredCredits);
    
    if (!creditCheck.hasEnoughCredits) {
      throw new Error(`Insufficient credits. Need ${requiredCredits}, have ${creditCheck.monthlyCredits + creditCheck.purchasedCredits}`);
    }

    const optimizationPrompt = this.buildOptimizationPrompt(request);
    
    const result = await this.aiService.generate({
      prompt: optimizationPrompt,
      model: 'deepseek',
      maxTokens: 800,
      temperature: 0.7,
      userId: request.userId
    });

    // Deduct credits
    await this.creditService.deductCredits(request.userId, requiredCredits, 'PROMPT_OPTIMIZATION');

    // Parse AI response
    const parsed = this.parseOptimizationResponse(result.text);

    return {
      optimizedPrompt: parsed.optimizedPrompt,
      suggestions: parsed.suggestions,
      improvements: parsed.improvements,
      tokensUsed: result.tokenCount,
      creditsConsumed: requiredCredits
    };
  }

  private buildOptimizationPrompt(request: OptimizationRequest): string {
    return `You are an expert prompt engineer. Transform the user's idea into an optimized, effective prompt.

USER IDEA: "${request.userIdea}"
${request.requirements ? `REQUIREMENTS: ${request.requirements}` : ''}
${request.targetAudience ? `TARGET AUDIENCE: ${request.targetAudience}` : ''}
${request.promptType ? `PROMPT TYPE: ${request.promptType}` : ''}
${request.tone ? `DESIRED TONE: ${request.tone}` : ''}

Create an optimized prompt following these best practices:
1. Clear, specific instructions
2. Proper context setting
3. Expected output format
4. Relevant examples if needed
5. Appropriate constraints

Respond in this exact JSON format:
{
  "optimizedPrompt": "The complete optimized prompt here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;
  }

  private parseOptimizationResponse(response: string): {
    optimizedPrompt: string;
    suggestions: string[];
    improvements: string[];
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        optimizedPrompt: parsed.optimizedPrompt || '',
        suggestions: parsed.suggestions || [],
        improvements: parsed.improvements || []
      };
    } catch (error) {
      // Fallback parsing if JSON fails
      return {
        optimizedPrompt: response,
        suggestions: ['Review the generated prompt for clarity'],
        improvements: ['Consider adding more specific instructions']
      };
    }
  }

  public async generatePromptVariations(basePrompt: string, userId: string, count: number = 3): Promise<string[]> {
    const requiredCredits = count * 2;
    const creditCheck = await this.creditService.checkCreditBalance(userId, requiredCredits);
    
    if (!creditCheck.hasEnoughCredits) {
      throw new Error(`Insufficient credits for ${count} variations`);
    }

    const variationPrompt = `Create ${count} different variations of this prompt, each with a slightly different approach or emphasis:

ORIGINAL PROMPT: "${basePrompt}"

Return only the variations, one per line, numbered 1-${count}.`;

    const result = await this.aiService.generate({
      prompt: variationPrompt,
      model: 'deepseek',
      maxTokens: 600,
      temperature: 0.8,
      userId
    });

    await this.creditService.deductCredits(userId, requiredCredits, 'PROMPT_VARIATIONS');

    return this.parseVariations(result.text, count);
  }

  private parseVariations(response: string, expectedCount: number): string[] {
    const lines = response.split('\n').filter(line => line.trim());
    const variations: string[] = [];
    
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        variations.push(match[1].trim());
      }
    }
    
    return variations.slice(0, expectedCount);
  }
}
