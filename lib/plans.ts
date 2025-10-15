export const PLANS = {
  TRIAL: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    trialDays: 14,
    limits: {
      trackedRuns: -1, // unlimited during trial
      promptsTracked: -1,
      dataRetention: 14,
      teamMembers: 1,
    },
    features: [
      'All Pro features',
      'Unlimited requests',
      'Smart routing (saves 30-60%)',
      'Prompt optimization',
      'Smart caching',
      'Priority support',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      trackedRuns: -1, // unlimited
      promptsTracked: -1,
      dataRetention: 30,
      teamMembers: 1,
    },
    features: [
      'Everything in trial',
      'Unlimited requests forever',
      '30 days data retention',
      'Advanced analytics',
      'Priority support',
      'Cancel anytime',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: {
      trackedRuns: -1,
      promptsTracked: -1,
      dataRetention: 90,
      teamMembers: -1,
    },
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom limits',
      '90 days data retention',
      'Budget controls',
      'SSO & SAML',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Legacy support
export const FREE = PLANS.TRIAL;
export const STARTER = PLANS.PRO;
