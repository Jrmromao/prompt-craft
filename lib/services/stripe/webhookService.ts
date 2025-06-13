import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { StripeWebhookError } from './errors';
import { SubscriptionStatus } from '@prisma/client';
import { DatabaseService } from '@/lib/services/database/databaseService';
import { EmailService } from '@/lib/services/emailService';

type StripeWebhookEvent = 
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'invoice.upcoming'
  | 'payment_intent.succeeded'
  | 'payment_intent.failed';

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
      switch (event.type as StripeWebhookEvent) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.upcoming':
          await this.handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Log successful event processing
      await this.logEvent(event, 'success');
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
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

  private async handleSubscriptionChange(subscription: Stripe.Subscription) {
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

  private async handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in subscription metadata');
    }

    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'subscription.trial_ending',
        resource: 'subscription',
        details: {
          subscriptionId: subscription.id,
          trialEnd: new Date(subscription.trial_end! * 1000),
        },
      },
    });

    // TODO: Send email notification
    console.log('Trial ending soon for user:', user.email);
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

  private async handleInvoiceUpcoming(invoice: Stripe.Invoice) {
    const userId = invoice.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in invoice metadata');
    }

    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'invoice.upcoming',
        resource: 'invoice',
        details: {
          invoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          dueDate: new Date(invoice.due_date! * 1000),
        },
      },
    });

    // TODO: Send email notification
    console.log('Upcoming invoice for user:', user.email);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in payment intent metadata');
    }

    try {
      // Start a transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Get user details for email
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (!user?.email) {
          throw new Error('User email not found');
        }

        // Create payment record
        await tx.auditLog.create({
          data: {
            userId,
            action: 'payment.succeeded',
            resource: 'payment_intent',
            details: {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
              paymentMethodId: typeof paymentIntent.payment_method === 'string' 
                ? paymentIntent.payment_method 
                : paymentIntent.payment_method?.id,
            },
          },
        });

        // Update user's status
        await tx.user.update({
          where: { id: userId },
          data: {
            status: 'ACTIVE',
          },
        });

        // Send success email
        const emailService = EmailService.getInstance();
        await emailService.sendEmail({
          email: user.email,
          subject: 'Payment Successful - PromptHive',
          html: `
            <h1>Payment Successful</h1>
            <p>Hello ${user.name || 'there'},</p>
            <p>Your payment of ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()} has been processed successfully.</p>
            <p>Thank you for your continued support!</p>
          `,
        });
      });

      // Log success
      console.log(`Payment intent ${paymentIntent.id} succeeded for user ${userId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to process successful payment intent ${paymentIntent.id}:`, error);
      throw new StripeWebhookError(`Failed to process successful payment intent: ${errorMessage}`);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) {
      throw new Error('Missing userId in payment intent metadata');
    }

    try {
      // Start a transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Get user details for email
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (!user?.email) {
          throw new Error('User email not found');
        }

        // Create payment failure record
        await tx.auditLog.create({
          data: {
            userId,
            action: 'payment.failed',
            resource: 'payment_intent',
            details: {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
              error: paymentIntent.last_payment_error ? {
                code: paymentIntent.last_payment_error.code,
                message: paymentIntent.last_payment_error.message,
                type: paymentIntent.last_payment_error.type,
                decline_code: paymentIntent.last_payment_error.decline_code,
              } : null,
              paymentMethodId: typeof paymentIntent.payment_method === 'string' 
                ? paymentIntent.payment_method 
                : paymentIntent.payment_method?.id,
            },
          },
        });

        // Update user's status
        await tx.user.update({
          where: { id: userId },
          data: {
            status: 'SUSPENDED',
          },
        });

        // Send payment failure email
        const emailService = EmailService.getInstance();
        const errorMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
        await emailService.sendPaymentFailureAlert({
          email: user.email,
          error: errorMessage,
        });
      });

      // Log failure
      console.error(`Payment intent ${paymentIntent.id} failed for user ${userId}`, {
        error: paymentIntent.last_payment_error,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to process failed payment intent ${paymentIntent.id}:`, error);
      throw new StripeWebhookError(`Failed to process failed payment intent: ${errorMessage}`);
    }
  }
}
