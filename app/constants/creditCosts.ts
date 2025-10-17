export const CREDIT_COSTS = {
  // AI Operations
  PROMPT_OPTIMIZATION: 5,
  PROMPT_VARIATION: 2,
  PROMPT_TEST_RUN: 1,
  AI_GENERATION: 3,
  
  // Playground Operations
  PLAYGROUND_RUN: 2,
  
  // Premium Features (PRO only)
  VERSION_CONTROL: 0, // Free for PRO users
  ANALYTICS_EXPORT: 1,
  PRIORITY_SUPPORT: 0, // Free for PRO users
  
  // Community Features
  UPVOTE_REWARD: 1, // Credits earned for receiving upvotes
  DAILY_LOGIN_BONUS: 2, // Daily login streak bonus
  
  // Bulk Operations
  BULK_PROMPT_IMPORT: 10,
  BULK_EXPORT: 5,
} as const;

export const PLAN_MULTIPLIERS = {
  FREE: 1.0, // Full cost
  STARTER: 0.9, // 10% discount on credit purchases
  PRO: 0.8,  // 20% discount on credit purchases
  ENTERPRISE: 0.5, // 50% discount on credit purchases
} as const;

export const CREDIT_EARNING_RATES = {
  // Community engagement rewards
  PROMPT_UPVOTE: 1,
  COMMENT_UPVOTE: 0.5,
  DAILY_LOGIN: 2,
  WEEKLY_STREAK: 5,
  MONTHLY_STREAK: 20,
  
  // Quality bonuses
  FEATURED_PROMPT: 10,
  TRENDING_PROMPT: 5,
  HELPFUL_COMMENT: 2,
} as const;

export function calculateCreditCost(
  operation: keyof typeof CREDIT_COSTS,
  planType: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' = 'FREE'
): number {
  const baseCost = CREDIT_COSTS[operation];
  const multiplier = PLAN_MULTIPLIERS[planType];
  return Math.ceil(baseCost * multiplier);
}

export function canAffordOperation(
  availableCredits: number,
  operation: keyof typeof CREDIT_COSTS,
  planType: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' = 'FREE'
): boolean {
  const cost = calculateCreditCost(operation, planType);
  return availableCredits >= cost;
}
