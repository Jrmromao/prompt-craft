export const PLAN_LIMITS = {
  FREE: {
    // Core limits
    monthlyCredits: 100,
    privatePrompts: 3,
    publicPrompts: -1, // Unlimited
    
    // Feature access
    versionControl: false,
    analytics: false,
    prioritySupport: false,
    premiumModels: false,
    
    // Usage limits
    playgroundRuns: 50, // Per month
    testRuns: 20, // Per month
    apiCalls: 100, // Per month
    
    // Storage limits
    promptStorage: 1000, // KB
    fileUploads: 5, // Per month
    
    // Community features
    votesPerDay: 20,
    commentsPerDay: 10,
  },
  PRO: {
    // Core limits
    monthlyCredits: 500,
    privatePrompts: 20,
    publicPrompts: -1, // Unlimited
    
    // Feature access
    versionControl: true,
    analytics: true,
    prioritySupport: true,
    premiumModels: true,
    
    // Usage limits
    playgroundRuns: -1, // Unlimited (credit-limited)
    testRuns: -1, // Unlimited (credit-limited)
    apiCalls: 1000, // Per month
    
    // Storage limits
    promptStorage: 10000, // KB
    fileUploads: 50, // Per month
    
    // Community features
    votesPerDay: 100,
    commentsPerDay: 50,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimit(
  planType: PlanType,
  feature: keyof typeof PLAN_LIMITS.FREE
): number | boolean {
  return PLAN_LIMITS[planType][feature];
}

export function hasFeatureAccess(
  planType: PlanType,
  feature: keyof typeof PLAN_LIMITS.FREE
): boolean {
  const limit = getPlanLimit(planType, feature);
  return limit === true || limit === -1 || (typeof limit === 'number' && limit > 0);
}

export function isWithinLimit(
  planType: PlanType,
  feature: keyof typeof PLAN_LIMITS.FREE,
  currentUsage: number
): boolean {
  const limit = getPlanLimit(planType, feature);
  
  if (limit === -1 || limit === true) return true;
  if (limit === false) return false;
  if (typeof limit === 'number') return currentUsage < limit;
  
  return false;
}
