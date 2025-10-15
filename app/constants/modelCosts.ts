/**
 * Real API costs per 1M tokens (as of October 2025)
 * Source: Official API pricing pages
 */

export interface ModelCost {
  input: number;   // Cost per 1M input tokens in USD
  output: number;  // Cost per 1M output tokens in USD
  provider: string;
  tier: 'free' | 'standard' | 'premium' | 'enterprise';
}

export const MODEL_COSTS: Record<string, ModelCost> = {
  // DeepSeek (Cheapest - Default for all users)
  'deepseek-chat': {
    input: 0.14,
    output: 0.28,
    provider: 'DeepSeek',
    tier: 'free'
  },
  'deepseek-coder-6.7b': {
    input: 0.10,
    output: 0.20,
    provider: 'DeepSeek',
    tier: 'free'
  },
  'deepseek-coder-33b': {
    input: 0.27,
    output: 0.54,
    provider: 'DeepSeek',
    tier: 'standard'
  },
  
  // OpenAI (Standard)
  'gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50,
    provider: 'OpenAI',
    tier: 'standard'
  },
  'gpt-4-turbo': {
    input: 10.00,
    output: 30.00,
    provider: 'OpenAI',
    tier: 'premium'
  },
  'gpt-4': {
    input: 30.00,
    output: 60.00,
    provider: 'OpenAI',
    tier: 'enterprise'
  },
  
  // Anthropic (Premium)
  'claude-3.5-sonnet': {
    input: 3.00,
    output: 15.00,
    provider: 'Anthropic',
    tier: 'premium'
  },
  'claude-3-opus': {
    input: 15.00,
    output: 75.00,
    provider: 'Anthropic',
    tier: 'enterprise'
  },
  'claude-3-haiku': {
    input: 0.25,
    output: 1.25,
    provider: 'Anthropic',
    tier: 'standard'
  },
  
  // Google (Standard)
  'gemini-pro': {
    input: 0.50,
    output: 1.50,
    provider: 'Google',
    tier: 'standard'
  },
  'gemini-pro-vision': {
    input: 0.50,
    output: 1.50,
    provider: 'Google',
    tier: 'standard'
  }
} as const;

/**
 * Hard cost limits per user per month (USD)
 */
export const COST_LIMITS = {
  FREE: 0.50,      // $0.50/month max (prevents abuse)
  PRO: 5.00,       // $5/month max (reasonable limit)
  ENTERPRISE: 50.00 // $50/month max (high usage)
} as const;

/**
 * Calculate actual API cost in USD
 */
export function calculateApiCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model];
  
  if (!costs) {
    console.warn(`Unknown model: ${model}, using deepseek-chat costs`);
    return calculateApiCost('deepseek-chat', inputTokens, outputTokens);
  }
  
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  
  return inputCost + outputCost;
}

/**
 * Convert API cost to credits
 * 1 credit = $0.01 (1 cent)
 */
export function costToCredits(costUSD: number): number {
  return Math.ceil(costUSD * 100);
}

/**
 * Convert credits to USD
 */
export function creditsToUSD(credits: number): number {
  return credits / 100;
}

/**
 * Get model tier for access control
 */
export function getModelTier(model: string): 'free' | 'standard' | 'premium' | 'enterprise' {
  return MODEL_COSTS[model]?.tier || 'free';
}

/**
 * Check if user plan can access model
 */
export function canAccessModel(
  model: string,
  userPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
): boolean {
  const tier = getModelTier(model);
  
  if (userPlan === 'ENTERPRISE') return true;
  if (userPlan === 'PRO') return tier !== 'enterprise';
  if (userPlan === 'FREE') return tier === 'free';
  
  return false;
}

/**
 * Get cheapest model for fallback
 */
export function getCheapestModel(): string {
  return 'deepseek-coder-6.7b';
}

/**
 * Estimate tokens from text (rough approximation)
 * Average: 1 token ≈ 4 characters
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost before API call
 */
export function estimateCost(
  model: string,
  promptText: string,
  expectedOutputTokens: number = 500
): { costUSD: number; credits: number; tokens: { input: number; output: number } } {
  const inputTokens = estimateTokens(promptText);
  const outputTokens = expectedOutputTokens;
  const costUSD = calculateApiCost(model, inputTokens, outputTokens);
  const credits = costToCredits(costUSD);
  
  return {
    costUSD,
    credits,
    tokens: { input: inputTokens, output: outputTokens }
  };
}

/**
 * Get all available models for a plan
 */
export function getAvailableModels(userPlan: 'FREE' | 'PRO' | 'ENTERPRISE'): string[] {
  return Object.keys(MODEL_COSTS).filter(model => canAccessModel(model, userPlan));
}

/**
 * Get model cost summary for display
 */
export function getModelCostSummary(model: string): string {
  const costs = MODEL_COSTS[model];
  if (!costs) return 'Unknown model';
  
  const avgCost = (costs.input + costs.output) / 2;
  
  if (avgCost < 0.5) return '💚 Very cheap';
  if (avgCost < 2) return '💛 Affordable';
  if (avgCost < 10) return '🟠 Moderate';
  return '🔴 Expensive';
}
