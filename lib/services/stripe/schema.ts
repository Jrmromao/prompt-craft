import { Stripe } from 'stripe';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  metadata: {
    userId: string;
    clerkId: string;
  };
  defaultPaymentMethod?: string;
  invoiceSettings?: {
    defaultPaymentMethod?: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
}

export interface Subscription {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
  priceId: string;
  quantity: number;
  metadata?: Record<string, string>;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  dueDate?: Date;
  paid: boolean;
  paymentIntent?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

export interface CheckoutSession {
  id: string;
  customerId: string;
  subscriptionId?: string;
  status: 'open' | 'complete' | 'expired';
  url?: string;
  amountTotal?: number;
  currency?: string;
  metadata: {
    userId: string;
    planId: string;
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  apiVersion: string;
}

export interface StripeError {
  type: string;
  code: string;
  message: string;
  decline_code?: string;
  raw?: any;
}

export interface CreateCheckoutSessionParams {
  customerId: string;
  priceId: string;
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
  prorationBehavior?: 'always_invoice' | 'create_prorations' | 'none';
  metadata?: Record<string, string>;
}

export interface CreateCustomerParams {
  email: string;
  userId: string;
  clerkId: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface UpdateCustomerParams {
  customerId: string;
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
  defaultPaymentMethod?: string;
}
