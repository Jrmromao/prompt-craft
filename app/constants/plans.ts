export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ELITE = 'ELITE',
  ENTERPRISE = 'ENTERPRISE'
}

export type PlanFeature = {
  name: string;
  description: string;
  isPostMVP?: boolean;
};

export type Plan = {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: PlanFeature[];
  limits: {
    promptRuns: number;
    testRuns: number;
    teamMembers?: number;
    customModels?: number;
    tokens: number;
  };
  models: {
    deepseek: boolean;
    gpt35: boolean;
    premium: boolean;
  };
  byok: {
    enabled: boolean;
    unlimitedTestRuns: boolean;
  };
  credits: {
    enabled: boolean;
    minimumPurchase: number;
    pricePerCredit: number;
  };
};

export const PLANS: Record<PlanType, Plan> = {
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: 'Free',
    description: 'Perfect for individuals getting started with prompt engineering',
    price: {
      monthly: 0,
      annual: 0,
    },
    features: [
      {
        name: 'Basic Prompt Management',
        description: 'Create and manage up to 5 prompts',
      },
      {
        name: 'Community Access',
        description: 'Access to public prompts and community features',
      },
      {
        name: 'Basic Analytics',
        description: 'View basic usage statistics',
      },
    ],
    limits: {
      promptRuns: 100,
      testRuns: 50,
      tokens: 10000,
    },
    models: {
      deepseek: false,
      gpt35: true,
      premium: false,
    },
    byok: {
      enabled: false,
      unlimitedTestRuns: false,
    },
    credits: {
      enabled: true,
      minimumPurchase: 10,
      pricePerCredit: 0.01,
    },
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    description: 'For professionals who need more power and flexibility',
    price: {
      monthly: 19,
      annual: 180, // $15/month when paid annually
    },
    features: [
      {
        name: 'Advanced Prompt Management',
        description: 'Unlimited prompts and advanced organization features',
      },
      {
        name: 'Team Collaboration',
        description: 'Up to 5 team members',
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed usage statistics and insights',
      },
      {
        name: 'Custom Models',
        description: 'Support for up to 3 custom models',
        isPostMVP: true,
      },
    ],
    limits: {
      promptRuns: 1000,
      testRuns: 500,
      teamMembers: 5,
      customModels: 3,
      tokens: 100000,
    },
    models: {
      deepseek: true,
      gpt35: true,
      premium: true,
    },
    byok: {
      enabled: true,
      unlimitedTestRuns: false,
    },
    credits: {
      enabled: true,
      minimumPurchase: 50,
      pricePerCredit: 0.008,
    },
  },
  [PlanType.ELITE]: {
    id: PlanType.ELITE,
    name: 'Elite',
    description: 'For teams that need enterprise-grade features and support',
    price: {
      monthly: 49,
      annual: 468, // $39/month when paid annually
    },
    features: [
      {
        name: 'Enterprise Features',
        description: 'All Pro features plus advanced security and compliance',
      },
      {
        name: 'Unlimited Team Members',
        description: 'Add as many team members as you need',
      },
      {
        name: 'Priority Support',
        description: '24/7 priority support and dedicated account manager',
      },
      {
        name: 'Custom Integrations',
        description: 'API access and custom integration support',
        isPostMVP: true,
      },
    ],
    limits: {
      promptRuns: 10000,
      testRuns: 5000,
      teamMembers: -1, // Unlimited
      customModels: 10,
      tokens: 500000,
    },
    models: {
      deepseek: true,
      gpt35: true,
      premium: true,
    },
    byok: {
      enabled: true,
      unlimitedTestRuns: true,
    },
    credits: {
      enabled: false,
      minimumPurchase: 0,
      pricePerCredit: 0,
    },
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: {
      monthly: -1, // Custom pricing
      annual: -1, // Custom pricing
    },
    features: [
      {
        name: 'Custom Solutions',
        description: 'Tailored features and integrations for your organization',
      },
      {
        name: 'Dedicated Support',
        description: '24/7 dedicated support team and account management',
      },
      {
        name: 'SLA Guarantee',
        description: 'Service level agreement with guaranteed uptime',
      },
      {
        name: 'Custom Development',
        description: 'Custom feature development and integration support',
        isPostMVP: true,
      },
    ],
    limits: {
      promptRuns: -1, // Unlimited
      testRuns: -1, // Unlimited
      teamMembers: -1, // Unlimited
      customModels: -1, // Unlimited
      tokens: -1, // Unlimited
    },
    models: {
      deepseek: true,
      gpt35: true,
      premium: true,
    },
    byok: {
      enabled: true,
      unlimitedTestRuns: true,
    },
    credits: {
      enabled: false,
      minimumPurchase: 0,
      pricePerCredit: 0,
    },
  },
};

// Helper functions to check plan features and limits
export const hasFeature = (plan: Plan, featureName: string): boolean => {
  return plan.features.some(feature => feature.name === featureName);
};

export const isPostMVPFeature = (plan: Plan, featureName: string): boolean => {
  const feature = plan.features.find(f => f.name === featureName);
  return feature?.isPostMVP || false;
};

export const getPlanById = (planId: PlanType): Plan | undefined => {
  return PLANS[planId];
}; 