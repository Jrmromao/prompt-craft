import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { StripeWebhookError, handleStripeError } from './errors';
import { SubscriptionStatus } from '@prisma/client';
import { DatabaseService } from '@/lib/services/database/databaseService';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

export class WebhookService {
  private static instance: WebhookService;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private databaseService: DatabaseService;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
  }

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  public async constructEvent(
    payload: string,
    signature: string,
    secret: string
  ): Promise<WebhookEvent> {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error: any) {
      throw new StripeWebhookError(`Webhook signature verification failed: ${error.message}`);
    }
  }

  public async handleEvent(event: WebhookEvent): Promise<void> {
    const handler = this.getEventHandler(event.type);
    if (!handler) {
      console.warn(`Unhandled event type: ${event.type}`);
      return;
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        await handler(event.data.object);
        return;
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * retries));
      }
    }
  }

  private getEventHandler(type: string): ((data: any) => Promise<void>) | null {
    const handlers: Record<string, (data: any) => Promise<void>> = {
      'checkout.session.completed': this.handleCheckoutSessionCompleted.bind(this),
      'customer.subscription.updated': this.handleSubscriptionUpdated.bind(this),
      'customer.subscription.deleted': this.handleSubscriptionDeleted.bind(this),
    };
    return handlers[type] || null;
  }

  private async handleCheckoutSessionCompleted(session: any): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await this.databaseService.createSubscription({
      user: { connect: { id: session.metadata?.userId } },
      plan: { connect: { id: session.metadata?.planId } },
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: session.customer as string,
      status: subscription.status.toUpperCase() as SubscriptionStatus,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    await this.databaseService.updateSubscription(subscription.id, {
      status: subscription.status.toUpperCase() as SubscriptionStatus,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    await this.databaseService.updateSubscription(subscription.id, {
      status: 'CANCELED' as SubscriptionStatus,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: true,
    });
  }
}
