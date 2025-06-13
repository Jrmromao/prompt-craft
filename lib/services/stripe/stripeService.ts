import { stripe } from '@/lib/stripe';
import {
  StripeCustomer,
  StripeSubscription,
  StripeCheckoutSession,
  StripeError,
  CreateCheckoutSessionParams,
  CreateCustomerParams,
  UpdateSubscriptionParams,
  CreateCreditPurchaseParams,
} from './types';

export class StripeService {
  private static instance: StripeService;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createCustomer({ email, userId, clerkId }: CreateCustomerParams): Promise<StripeCustomer> {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          clerkId,
        },
      });

      return {
        id: customer.id,
        email: customer.email!,
        metadata: {
          userId,
          clerkId,
        },
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createCheckoutSession({
    customerId,
    planId,
    priceId,
    userId,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams): Promise<StripeCheckoutSession> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId,
          priceId,
        },
      });

      return {
        id: session.id,
        url: session.url,
        customerId: session.customer as string,
        subscriptionId: session.subscription as string | null,
        metadata: {
          userId,
          planId,
          priceId,
        },
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const rawSubscription = subscription as any;

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(rawSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(rawSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: rawSubscription.cancel_at_period_end,
        planId: subscription.items.data[0].price.id,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateSubscription({
    subscriptionId,
    cancelAtPeriodEnd,
    prorationBehavior,
  }: UpdateSubscriptionParams): Promise<StripeSubscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
        proration_behavior: prorationBehavior,
      });
      const rawSubscription = subscription as any;

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(rawSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(rawSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: rawSubscription.cancel_at_period_end,
        planId: subscription.items.data[0].price.id,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async listPaymentMethods(customerId: string) {
    try {
      return await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async listInvoices(customerId: string, limit = 10) {
    try {
      return await stripe.invoices.list({
        customer: customerId,
        limit,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createCreditPurchaseSession({
    customerId,
    amount,
    price,
    userId,
    successUrl,
    cancelUrl,
  }: CreateCreditPurchaseParams): Promise<StripeCheckoutSession> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${amount} Credits`,
                description: 'AI Model Usage Credits',
              },
              unit_amount: price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          amount: amount.toString(),
          type: 'credit_purchase',
        },
      });

      return {
        id: session.id,
        url: session.url,
        customerId: session.customer as string,
        subscriptionId: null,
        metadata: {
          userId,
          amount: amount.toString(),
          type: 'credit_purchase',
        },
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    if (error instanceof Error) {
      const stripeError = error as StripeError;
      console.error('Stripe Error:', stripeError.message);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}
