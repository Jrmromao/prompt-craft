export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: Array<{
    name: string;
    description: string;
  }>;
  limits: {
    promptRuns: number;
    testRuns: number;
    tokens: number;
  };
  models: {
    gpt35: boolean;
    gpt4: boolean;
  };
  byok: {
    enabled: boolean;
  };
  credits: {
    included: number;
  };
}

export const PLANS: Record<PlanType, Plan> = {
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: 'Free Trial',
    description: '14-day trial with all Pro features',
    price: {
      monthly: 0,
      annual: 0
    },
    features: [
      { name: 'AI Prompt Optimization', description: '50-80% cost reduction' },
      { name: 'Smart Routing', description: 'Auto-select cheapest model' },
      { name: 'Cost Tracking', description: 'Real-time cost analytics' },
      { name: 'Auto-Fallback', description: 'Never fail on rate limits' },
      { name: '14-Day Trial', description: 'All Pro features included' },
    ],
    limits: {
      promptRuns: 1000,
      testRuns: 0,
      tokens: 100000
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: true
    },
    credits: {
      included: 1000
    }
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    description: 'Save $30+/month on AI costs',
    price: {
      monthly: 9,
      annual: 86.40 // $7.20/month when billed annually (20% savings)
    },
    features: [
      { name: 'AI Prompt Optimization', description: '50-80% token reduction' },
      { name: 'Smart Routing', description: 'Auto-route to cheapest model' },
      { name: 'Real Savings Tracking', description: 'See actual $ saved' },
      { name: 'Auto-Fallback', description: 'Automatic failover chains' },
      { name: 'Cost Limits', description: 'Prevent budget overruns' },
      { name: 'Email Alerts', description: 'Cost spike & error notifications' },
      { name: 'Unlimited API Keys', description: 'Up to 5 keys' },
      { name: 'Advanced Analytics', description: 'Cost/performance insights' },
      { name: 'Priority Support', description: 'Email support' },
    ],
    limits: {
      promptRuns: -1, // unlimited
      testRuns: 0,
      tokens: -1 // unlimited
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: true
    },
    credits: {
      included: -1 // unlimited
    }
  },
};

export const getPlanById = (planId: PlanType): Plan | undefined => {
  return PLANS[planId];
};

export const hasFeature = (plan: Plan, featureName: string): boolean => {
  return plan.features.some(feature => feature.name === featureName);
}; 