/**
 * Cost Calculator Service
 * Calculates costs for different AI models
 */

export interface ModelPricing {
  input: number;  // per 1k tokens
  output: number; // per 1k tokens
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  
  // Anthropic
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  
  // Others
  'deepseek-chat': { input: 0.00014, output: 0.00028 },
};

export class CostCalculator {
  static calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = MODEL_PRICING[model];
    
    if (!pricing) {
      // Default to GPT-3.5 pricing if model not found
      const defaultPricing = MODEL_PRICING['gpt-3.5-turbo'];
      return (
        (inputTokens / 1000) * defaultPricing.input +
        (outputTokens / 1000) * defaultPricing.output
      );
    }
    
    return (
      (inputTokens / 1000) * pricing.input +
      (outputTokens / 1000) * pricing.output
    );
  }

  static estimateCost(
    model: string,
    promptLength: number,
    maxTokens: number = 500
  ): number {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedInputTokens = Math.ceil(promptLength / 4);
    const estimatedOutputTokens = maxTokens;
    
    return this.calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
  }

  static compareModels(inputTokens: number, outputTokens: number) {
    return Object.entries(MODEL_PRICING).map(([model, pricing]) => ({
      model,
      cost: this.calculateCost(model, inputTokens, outputTokens),
      inputCost: (inputTokens / 1000) * pricing.input,
      outputCost: (outputTokens / 1000) * pricing.output,
    })).sort((a, b) => a.cost - b.cost);
  }

  static calculateSavings(
    currentModel: string,
    alternativeModel: string,
    monthlyRuns: number,
    avgInputTokens: number,
    avgOutputTokens: number
  ): number {
    const currentCost = this.calculateCost(currentModel, avgInputTokens, avgOutputTokens);
    const alternativeCost = this.calculateCost(alternativeModel, avgInputTokens, avgOutputTokens);
    
    return (currentCost - alternativeCost) * monthlyRuns;
  }
}
