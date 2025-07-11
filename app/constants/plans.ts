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
    name: 'Free',
    description: 'Get started with the basics',
    price: {
      monthly: 0,
      annual: 0
    },
    features: [
      { name: 'Credits', description: '100 credits/month (resets monthly)' },
      { name: 'Private Prompts', description: 'Up to 3 private prompts' },
      { name: 'Public Prompts', description: 'Create public prompts' },
    ],
    limits: {
      promptRuns: 100,
      testRuns: 0,
      tokens: 100000
    },
    models: {
      gpt35: true,
      gpt4: false
    },
    byok: {
      enabled: false
    },
    credits: {
      included: 100
    }
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    description: 'For professionals and creators',
    price: {
      monthly: 19,
      annual: 180 // $15/month when billed annually (21% savings)
    },
    features: [
      { name: 'Credits', description: '500 credits/month (resets monthly)' },
      { name: 'Private Prompts', description: 'Up to 20 private prompts' },
      { name: 'Version Control', description: 'Prompt version control' },
      { name: 'Priority Support', description: 'Priority support' },
    ],
    limits: {
      promptRuns: 500,
      testRuns: 0,
      tokens: 0
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: false
    },
    credits: {
      included: 500
    }
  },
};

export const getPlanById = (planId: PlanType): Plan | undefined => {
  return PLANS[planId];
};

export const hasFeature = (plan: Plan, featureName: string): boolean => {
  return plan.features.some(feature => feature.name === featureName);
}; 