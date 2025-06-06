import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { StripeWebhookError, handleStripeError } from './errors';
import { SubscriptionStatus } from '@prisma/client';

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

  private constructor() {}

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  async constructEvent(payload: string, signature: string, secret: string): Promise<WebhookEvent> {
    try {
      return await stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      if (error instanceof Error) {
        throw new StripeWebhookError(`Webhook signature verification failed: ${error.message}`);
      }
      throw new StripeWebhookError('Webhook signature verification failed: Unknown error');
    }
  }

  async handleEvent(event: WebhookEvent): Promise<void> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.maxRetries) {
      try {
        await this.processEvent(event);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        retries++;
        if (retries < this.maxRetries) {
          await this.delay(this.retryDelay * retries);
        }
      }
    }

    // Log failed event after all retries
    await this.logFailedEvent(event, lastError);
    throw lastError;
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: any): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    await prisma.subscription.create({
      data: {
        userId: session.metadata?.userId!,
        planId: session.metadata?.planId!,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer as string,
        status: subscription.status.toUpperCase() as SubscriptionStatus,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: subscription.status.toUpperCase() as SubscriptionStatus,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: 'CANCELED' as SubscriptionStatus,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: true,
      },
    });
  }

  private async logFailedEvent(event: WebhookEvent, error: Error | null): Promise<void> {
    // Since webhookLog doesn't exist in the schema, we'll log to console for now
    console.error('Failed webhook event:', {
      eventId: event.id,
      eventType: event.type,
      payload: event.data,
      error: error?.message || 'Unknown error',
      retries: this.maxRetries,
      status: 'FAILED',
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 