import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { StripeWebhookError } from './errors';
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
  ): Promise<Stripe.Event> {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error: any) {
      throw new StripeWebhookError(`Webhook signature verification failed: ${error.message}`);
    }
  }

  public async handleEvent(event: Stripe.Event) {
    console.log('Processing webhook event:', event.type);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Log successful event processing
      await this.logEvent(event, 'success');
    } catch (error) {
      console.error(`Error processing webhook event ${event.type}:`, error);
      
      // Log failed event processing
      await this.logEvent(event, 'error', error);

      // Retry logic for failed events
      await this.retryEvent(event);
    }
  }

  private async retryEvent(event: Stripe.Event, attempt = 1) {
    if (attempt > this.maxRetries) {
      console.error(`Max retries reached for event ${event.id}`);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      await this.handleEvent(event);
    } catch (error) {
      console.error(`Retry attempt ${attempt} failed for event ${event.id}:`, error);
      await this.retryEvent(event, attempt + 1);
    }
  }

  private async logEvent(event: Stripe.Event, status: 'success' | 'error', error?: any) {
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: `webhook.${event.type}.${status}`,
        resource: 'webhook',
        details: {
          eventId: event.id,
          eventType: event.type,
          status,
          error: error?.message,
          timestamp: new Date(event.created * 1000),
        },
      },
    });
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (!session.customer || !session.subscription) {
      throw new Error('Missing customer or subscription in session');
    }

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      throw new Error('Missing userId or planId in session metadata');
    }

    // Update user's subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          upsert: {
            create: {
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
              planId: planId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(session.created * 1000),
              currentPeriodEnd: new Date(session.expires_at! * 1000),
            },
            update: {
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
              planId: planId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(session.created * 1000),
              currentPeriodEnd: new Date(session.expires_at! * 1000),
            },
          },
        },
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in subscription metadata');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            status: subscription.status.toUpperCase() as SubscriptionStatus,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        },
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in subscription metadata');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            status: 'CANCELED',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        },
      },
    });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const userId = invoice.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in invoice metadata');
    }

    // Update subscription status and period
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            status: 'ACTIVE',
            currentPeriodEnd: new Date(invoice.period_end * 1000),
          },
        },
      },
    });

    // Create billing record
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'billing.payment_succeeded',
        resource: 'invoice',
        details: {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          period: {
            start: new Date(invoice.period_start * 1000),
            end: new Date(invoice.period_end * 1000),
          },
        },
      },
    });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const userId = invoice.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in invoice metadata');
    }

    // Update subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            status: 'PAST_DUE',
          },
        },
      },
    });

    // Create billing record
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'billing.payment_failed',
        resource: 'invoice',
        details: {
          invoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          failureReason: invoice.status,
          nextPaymentAttempt: invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000)
            : null,
        },
      },
    });
  }
}
