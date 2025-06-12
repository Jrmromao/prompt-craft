export enum PlanType {
  PRO = 'PRO',
  ELITE = 'ELITE',
  ENTERPRISE = 'ENTERPRISE',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  features: string[];
  limits: {
    prompts: number;
    tokens: number;
    teamMembers: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
} 