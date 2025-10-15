export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      trackedRuns: 1000, // per month
      promptsTracked: 5,
      dataRetention: 7, // days
      teamMembers: 1,
    },
    features: [
      '1,000 tracked runs/month',
      'Track up to 5 prompts',
      '7 days data retention',
      'Basic analytics',
    ],
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    limits: {
      trackedRuns: 10000,
      promptsTracked: 25,
      dataRetention: 30,
      teamMembers: 3,
    },
    features: [
      '10,000 tracked runs/month',
      'Track up to 25 prompts',
      '30 days data retention',
      'Advanced analytics',
      'Cost optimization suggestions',
      'Email support',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      trackedRuns: 100000,
      promptsTracked: -1, // unlimited
      dataRetention: 90,
      teamMembers: 10,
    },
    features: [
      '100,000 tracked runs/month',
      'Unlimited prompts',
      '90 days data retention',
      'Advanced analytics',
      'Cost optimization suggestions',
      'A/B testing',
      'Custom alerts',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: {
      trackedRuns: -1, // unlimited
      promptsTracked: -1,
      dataRetention: 365,
      teamMembers: -1,
    },
    features: [
      'Unlimited tracked runs',
      'Unlimited prompts',
      '1 year data retention',
      'Advanced analytics',
      'Cost optimization suggestions',
      'A/B testing',
      'Custom alerts',
      'Dedicated support',
      'SSO',
      'Custom integrations',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
