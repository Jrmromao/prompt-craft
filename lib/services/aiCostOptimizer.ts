import OpenAI from 'openai';

interface OptimizationResult {
  original: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  tokenReduction: number;
  estimatedSavings: number;
  quality: number;
}

export class AICostOptimizer {
  private static openai: OpenAI | null = null;

  private static getClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your-openai-api-key') {
        throw new Error('OpenAI API key not configured');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  private static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private static calculateCost(tokens: number, model: string): number {
    const rates: Record<string, number> = {
      'gpt-4': 0.045,
      'gpt-3.5-turbo': 0.001,
      'claude-3-opus': 0.045,
      'claude-3-haiku': 0.000875,
    };

    const rate = rates[model] || 0.01;
    return (tokens / 1000) * rate;
  }

  static async optimizePrompt(
    prompt: string,
    targetModel: string = 'gpt-3.5-turbo'
  ): Promise<OptimizationResult> {
    try {
      const client = this.getClient();

      const systemPrompt = `You are a prompt optimization expert. Your job is to compress prompts while preserving their meaning and intent.

Rules:
1. Remove redundant words and phrases
2. Use concise language
3. Preserve all key information and instructions
4. Maintain the same tone and style
5. Keep the output clear and actionable
6. Aim for 30-50% token reduction

Return ONLY the optimized prompt, nothing else.`;

      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Optimize this prompt:\n\n${prompt}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const optimized = response.choices[0]?.message?.content?.trim() || prompt;

      const originalTokens = this.estimateTokens(prompt);
      const optimizedTokens = this.estimateTokens(optimized);
      const tokenReduction = Math.round(
        ((originalTokens - optimizedTokens) / originalTokens) * 100
      );

      const originalCost = this.calculateCost(originalTokens, targetModel);
      const optimizedCost = this.calculateCost(optimizedTokens, targetModel);
      const estimatedSavings = originalCost - optimizedCost;

      // Quality score: 1.0 if reduction is good, lower if too aggressive
      let quality = 1.0;
      if (tokenReduction > 70) quality = 0.6; // Too aggressive
      else if (tokenReduction > 50) quality = 0.8;
      else if (tokenReduction < 10) quality = 0.9; // Not much optimization

      return {
        original: prompt,
        optimized,
        originalTokens,
        optimizedTokens,
        tokenReduction,
        estimatedSavings,
        quality,
      };
    } catch (error: any) {
      console.error('Optimization error:', error);

      // Fallback: basic optimization
      const optimized = this.basicOptimization(prompt);
      const originalTokens = this.estimateTokens(prompt);
      const optimizedTokens = this.estimateTokens(optimized);
      const tokenReduction = Math.round(
        ((originalTokens - optimizedTokens) / originalTokens) * 100
      );

      return {
        original: prompt,
        optimized,
        originalTokens,
        optimizedTokens,
        tokenReduction,
        estimatedSavings: 0,
        quality: 0.7,
      };
    }
  }

  // Fallback optimization without AI
  private static basicOptimization(prompt: string): string {
    return prompt
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/please\s+/gi, '') // Remove politeness words
      .replace(/kindly\s+/gi, '')
      .replace(/I would like you to\s+/gi, '')
      .replace(/Can you\s+/gi, '')
      .replace(/Could you\s+/gi, '')
      .trim();
  }

  // Batch optimize multiple prompts
  static async optimizeBatch(
    prompts: string[],
    targetModel: string = 'gpt-3.5-turbo'
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const prompt of prompts) {
      try {
        const result = await this.optimizePrompt(prompt, targetModel);
        results.push(result);
      } catch (error) {
        console.error('Batch optimization error:', error);
        // Continue with next prompt
      }
    }

    return results;
  }

  // Check if optimization is worth it
  static shouldOptimize(prompt: string, threshold: number = 100): boolean {
    const tokens = this.estimateTokens(prompt);
    return tokens > threshold; // Only optimize if > 100 tokens
  }
}
