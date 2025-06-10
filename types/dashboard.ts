export interface Prompt {
  id: string;
  input: string;
  model: string;
  creditsUsed: number;
  createdAt: string;
}

export interface CreditHistory {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface UsageData {
  date: string;
  credits: number;
}

export interface DashboardClientProps {
  user: {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    imageUrl: string;
    credits: number;
    plan: {
      id: string;
      name: string;
      features: string[];
      price: number;
      createdAt: string;
      updatedAt: string;
      credits: number;
      creditCap: number;
      type: string;
      period: string;
      isActive: boolean;
    } | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    creditCap: number;
    lastCreditReset: string;
    stripeCustomerId: string;
  };
  prompts: Prompt[];
  creditHistory: CreditHistory[];
  usageData: UsageData[];
} 