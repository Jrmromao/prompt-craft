export interface CreditPackage {
  amount: number;
  price: number;
  bonus: number;
  popular: boolean;
  description: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    amount: 1000,
    price: 10,
    bonus: 0,
    popular: false,
    description: 'Perfect for trying out our AI models',
  },
  {
    amount: 5000,
    price: 45,
    bonus: 500,
    popular: true,
    description: 'Most popular choice for regular users',
  },
  {
    amount: 10000,
    price: 85,
    bonus: 1500,
    popular: false,
    description: 'Great value for power users',
  },
];

export const CREDIT_PURCHASE_METADATA = 'credit_purchase' as const;

export const STRIPE_API_VERSION = '2025-08-27.basil' as const; 