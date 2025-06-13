export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ELITE = 'ELITE',
  ENTERPRISE = 'ENTERPRISE'
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
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      annual: 0
    },
    features: [
      { name: 'Private Prompts', description: 'Create up to 3 private prompts per month' },
      { name: 'Prompt Runs', description: 'Run up to 100 prompts per month' },
      { name: 'Basic Support', description: 'Email support' }
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
      included: 0
    }
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    description: 'For professionals and small teams',
    price: {
      monthly: 29,
      annual: 290
    },
    features: [
      { name: 'Private Prompts', description: 'Create up to 50 private prompts per month' },
      { name: 'Prompt Runs', description: 'Run up to 1000 prompts per month' },
      { name: 'Version Control', description: 'Create up to 5 versions per prompt' },
      { name: 'Test Runs', description: 'Run up to 500 test runs per month' },
      { name: 'Priority Support', description: '24/7 email support' }
    ],
    limits: {
      promptRuns: 1000,
      testRuns: 500,
      tokens: 1000000
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: false
    },
    credits: {
      included: 100
    }
  },
  [PlanType.ELITE]: {
    id: PlanType.ELITE,
    name: 'Elite',
    description: 'For growing businesses',
    price: {
      monthly: 99,
      annual: 990
    },
    features: [
      { name: 'Unlimited Private Prompts', description: 'Create unlimited private prompts' },
      { name: 'Unlimited Prompt Runs', description: 'Run unlimited prompts' },
      { name: 'Unlimited Version Control', description: 'Create unlimited versions' },
      { name: 'Unlimited Test Runs', description: 'Run unlimited test runs' },
      { name: 'Priority Support', description: '24/7 priority support' }
    ],
    limits: {
      promptRuns: -1,
      testRuns: -1,
      tokens: -1
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: true
    },
    credits: {
      included: 500
    }
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'For large organizations',
    price: {
      monthly: 499,
      annual: 4990
    },
    features: [
      { name: 'Unlimited Everything', description: 'Unlimited access to all features' },
      { name: 'Custom Integration', description: 'Custom API integration' },
      { name: 'Dedicated Support', description: '24/7 dedicated support' },
      { name: 'SLA Guarantee', description: '99.9% uptime guarantee' }
    ],
    limits: {
      promptRuns: -1,
      testRuns: -1,
      tokens: -1
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: true
    },
    credits: {
      included: 2000
    }
  }
};

export const getPlanById = (planId: PlanType): Plan | undefined => {
  return PLANS[planId];
};

// Helper functions to check plan features and limits
export const hasFeature = (plan: Plan, featureName: string): boolean => {
  return plan.features.some(feature => feature.name === featureName);
};

export const PLANS_CONSTANTS = {
  [PlanType.FREE]: {
    name: 'Free',
    features: {
      private_prompts: 3,
      prompt_runs: 100,
      version_control: 0,
      test_runs: 0
    }
  },
  [PlanType.PRO]: {
    name: 'Pro',
    features: {
      private_prompts: 50,
      prompt_runs: 1000,
      version_control: 5,
      test_runs: 500
    }
  },
  [PlanType.ELITE]: {
    name: 'Elite',
    features: {
      private_prompts: -1, // unlimited
      prompt_runs: -1, // unlimited
      version_control: -1, // unlimited
      test_runs: -1 // unlimited
    }
  },
  [PlanType.ENTERPRISE]: {
    name: 'Enterprise',
    features: {
      private_prompts: -1, // unlimited
      prompt_runs: -1, // unlimited
      version_control: -1, // unlimited
      test_runs: -1 // unlimited
    }
  }
} as const; 