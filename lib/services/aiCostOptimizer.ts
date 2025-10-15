import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  /**
   * Optimize a prompt using GPT-4 mini (cheap and fast)
   */
  static async optimizePrompt(
    prompt: string,
    targetModel: string = 'gpt-3.5-turbo'
  ): Promise<OptimizationResult> {
    // Use GPT-4 mini for optimization (10x cheaper than GPT-4)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at optimizing prompts for cost efficiency.
          
Rules:
1. Remove redundant words and phrases
2. Use clear, direct language
3. Maintain the exact same intent and requirements
4. Keep all critical information
5. Return ONLY the optimized prompt, nothing else

Example:
Input: "You are a helpful assistant. Please write a professional email about the quarterly report. Make sure it is polite and includes all the key points."
Output: "Write a professional email about the quarterly report with key points."`,
        },
        {
          role: 'user',
          content: `Optimize this prompt:\n\n${prompt}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const optimized = response.choices[0]?.message?.content?.trim() || prompt;

    // Calculate tokens (rough estimate: 1 token ≈ 4 chars)
    const originalTokens = Math.ceil(prompt.length / 4);
    const optimizedTokens = Math.ceil(optimized.length / 4);
    const tokenReduction = Math.round(
      ((originalTokens - optimizedTokens) / originalTokens) * 100
    );

    // Calculate cost savings
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    };

    const modelPricing = pricing[targetModel] || pricing['gpt-3.5-turbo'];
    const avgOutputTokens = 500; // Assume 500 output tokens

    const originalCost =
      ((originalTokens * modelPricing.input) +
        (avgOutputTokens * modelPricing.output)) /
      1000;
    const optimizedCost =
      ((optimizedTokens * modelPricing.input) +
        (avgOutputTokens * modelPricing.output)) /
      1000;
    const savings = originalCost - optimizedCost;

    // Quality score (simple heuristic - can be improved)
    const quality = this.calculateQualityScore(prompt, optimized);

    return {
      original: prompt,
      optimized,
      originalTokens,
      optimizedTokens,
      tokenReduction,
      estimatedSavings: Math.round(savings * 10000) / 10000,
      quality,
    };
  }

  /**
   * Calculate quality score (0-100)
   * Simple heuristic: checks if key information is preserved
   */
  private static calculateQualityScore(
    original: string,
    optimized: string
  ): number {
    let score = 50; // Base score

    // Check length ratio (not too short)
    const lengthRatio = optimized.length / original.length;
    if (lengthRatio > 0.3 && lengthRatio < 0.9) score += 20;

    // Check if optimized is not empty
    if (optimized.length > 10) score += 10;

    // Check if optimized has proper structure
    if (optimized.match(/[.!?]$/)) score += 10;

    // Check if key words are preserved (simple check)
    const originalWords = original.toLowerCase().split(/\s+/);
    const optimizedWords = optimized.toLowerCase().split(/\s+/);
    const preservedWords = originalWords.filter((w) =>
      optimizedWords.includes(w)
    ).length;
    const preservationRatio = preservedWords / originalWords.length;
    score += Math.round(preservationRatio * 10);

    return Math.min(score, 100);
  }

  /**
   * Batch optimize multiple prompts
   */
  static async batchOptimize(
    prompts: string[],
    targetModel: string = 'gpt-3.5-turbo'
  ): Promise<OptimizationResult[]> {
    const results = await Promise.all(
      prompts.map((prompt) => this.optimizePrompt(prompt, targetModel))
    );
    return results;
  }

  /**
   * Analyze prompt and suggest optimizations without actually optimizing
   */
  static async analyzePrompt(prompt: string): Promise<{
    issues: string[];
    suggestions: string[];
    potentialSavings: number;
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for common issues
    if (prompt.includes('You are a helpful assistant')) {
      issues.push('Contains generic system prompt');
      suggestions.push('Remove "You are a helpful assistant" - it\'s redundant');
    }

    if (prompt.includes('Please') || prompt.includes('please')) {
      issues.push('Contains politeness words');
      suggestions.push('Remove politeness words like "please" - AI doesn\'t need them');
    }

    if (prompt.includes('Make sure') || prompt.includes('make sure')) {
      issues.push('Contains redundant instructions');
      suggestions.push('Remove "make sure" phrases - be direct');
    }

    if (prompt.split(' ').length > 100) {
      issues.push('Prompt is too long');
      suggestions.push('Shorten prompt to under 100 words');
    }

    // Estimate potential savings
    const currentTokens = Math.ceil(prompt.length / 4);
    const optimizedTokens = Math.ceil(currentTokens * 0.4); // Assume 60% reduction
    const potentialSavings = ((currentTokens - optimizedTokens) / 1000) * 0.0005; // GPT-3.5 pricing

    return {
      issues,
      suggestions,
      potentialSavings: Math.round(potentialSavings * 10000) / 10000,
    };
  }
}
