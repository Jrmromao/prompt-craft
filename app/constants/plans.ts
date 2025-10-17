export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
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
    description: 'Perfect for testing',
    price: {
      monthly: 0,
      annual: 0
    },
    features: [
      { name: 'Basic Analytics', description: 'Track your AI costs' },
      { name: 'Smart Routing', description: 'Auto-select cheapest model' },
      { name: '7-Day Retention', description: 'Data stored for 7 days' },
      { name: 'Community Support', description: 'Community forum access' },
    ],
    limits: {
      promptRuns: 1000,
      testRuns: 0,
      tokens: 100000
    },
    models: {
      gpt35: true,
      gpt4: false
    },
    byok: {
      enabled: true
    },
    credits: {
      included: 1000
    }
  },
  [PlanType.STARTER]: {
    id: PlanType.STARTER,
    name: 'Starter',
    description: 'Best value for growing teams',
    price: {
      monthly: 9,
      annual: 86.40
    },
    features: [
      { name: 'Everything in Free', description: 'All free features included' },
      { name: 'Redis Caching', description: '40% additional savings' },
      { name: '30-Day Retention', description: 'Data stored for 30 days' },
      { name: 'Email Support', description: 'Email support included' },
      { name: 'Savings Reports', description: 'Detailed savings analytics' },
      { name: 'Email Alerts', description: 'Cost spike notifications' },
    ],
    limits: {
      promptRuns: 10000,
      testRuns: 0,
      tokens: 500000
    },
    models: {
      gpt35: true,
      gpt4: true
    },
    byok: {
      enabled: true
    },
    credits: {
      included: 10000
    }
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    description: 'Most popular for serious users',
    price: {
      monthly: 29,
      annual: 278.40
    },
    features: [
      { name: 'Everything in Starter', description: 'All starter features' },
      { name: 'AI Prompt Optimization', description: '50-80% token reduction' },
      { name: 'Quality Monitoring', description: 'Track output quality' },
      { name: '90-Day Retention', description: 'Data stored for 90 days' },
      { name: 'Priority Support', description: 'Priority email support' },
      { name: 'Team (5 users)', description: 'Collaborate with team' },
      { name: 'Custom Alerts', description: 'Advanced alerting' },
    ],
    limits: {
      promptRuns: -1,
      testRuns: 0,
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
      included: -1
    }
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'Unlimited optimization',
    price: {
      monthly: 99,
      annual: 950.40
    },
    features: [
      { name: 'Everything in Pro', description: 'All pro features' },
      { name: 'SSO (SAML)', description: 'Single sign-on' },
      { name: '1-Year Retention', description: 'Data stored for 1 year' },
      { name: 'Dedicated Support', description: '24/7 dedicated support' },
      { name: 'Custom Integrations', description: 'Custom API integrations' },
      { name: 'Unlimited Users', description: 'No user limits' },
      { name: 'SLA Guarantee', description: '99.9% uptime SLA' },
    ],
    limits: {
      promptRuns: -1,
      testRuns: 0,
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
      included: -1
    }
  },
};

export const getPlanById = (planId: PlanType): Plan | undefined => {
  return PLANS[planId];
};

export const hasFeature = (plan: Plan, featureName: string): boolean => {
  return plan.features.some(feature => feature.name === featureName);
}; 