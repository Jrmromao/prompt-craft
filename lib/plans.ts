export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      trackedRuns: 1000,
      promptsTracked: -1,
      dataRetention: 7,
      teamMembers: 1,
    },
    features: [
      'Smart routing (saves 30-60%)',
      '1,000 requests/month',
      'Basic tracking',
      '7 days data retention',
      'Community support',
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
      'Everything in Free',
      'Unlimited requests',
      'Prompt optimization (50-80% savings)',
      'Smart caching',
      '30 days data retention',
      'Advanced analytics',
      'Priority support',
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
export const STARTER = PLANS.PRO;
