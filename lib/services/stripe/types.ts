import { Stripe } from 'stripe';

export interface StripeCustomer {
  id: string;
  email: string;
  metadata: {
    userId: string;
    clerkId: string;
  };
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  customerId: string;
  subscriptionId: string | null;
  metadata: {
    userId: string;
    planId: string;
  };
}

export interface StripeError extends Error {
  type: string;
  code: string;
  decline_code?: string;
  raw?: any;
}

export interface CreateCheckoutSessionParams {
  customerId: string;
  planId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCustomerParams {
  email: string;
  userId: string;
  clerkId: string;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
  prorationBehavior?: 'always_invoice' | 'create_prorations' | 'none';
}
