import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { Stripe } from 'stripe';

// Constants for better maintainability
const CURRENCY = 'usd';
const SUBSCRIPTION_MODE = 'subscription';
const SUCCESS_URL = '/settings/billing?success=true';
const CANCEL_URL = '/pricing';

// Error types for better error handling
class PaymentError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'PaymentError';
  }
}

class ValidationError extends PaymentError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authentication & Input Validation
    const { userId } = await auth();
    if (!userId) {
      throw new ValidationError('Unauthorized - No user ID found');
    }

    const body = await req.json();
    const { planId, stripePriceId, period } = body;

    if (!planId || !stripePriceId) {
      throw new ValidationError('Missing required fields: planId and stripePriceId are required');
    }

    // 2. Database Transaction for Data Consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get user with subscription
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      // Get plan details
      const plan = await tx.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new ValidationError('Plan not found');
      }

      return { user, plan };
    });

    const { user, plan } = result;

    // 3. Stripe Customer Management
    let customerId: string | null = user.stripeCustomerId;
    let customerExists = false;

    if (customerId) {
      try {
        // Verify customer exists and is valid
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) {
          throw new Error('Customer was deleted');
        }
        customerExists = true;
      } catch (error) {
        console.log('Customer verification failed:', error);
        customerExists = false;
        customerId = null;
      }
    }

    // 4. Create new customer if needed
    if (!customerExists) {
      try {
        const customer = await stripe.customers.create({
          email: user.email || '',
          metadata: {
            userId: user.id,
            clerkId: userId,
            environment: process.env.NODE_ENV,
          },
        });
        customerId = customer.id;

        // Update user with new customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        });
      } catch (error) {
        console.error('Failed to create Stripe customer:', error);
        throw new PaymentError('Failed to create payment account');
      }
    }

    if (!customerId) {
      throw new PaymentError('Failed to create or retrieve customer');
    }

    // 5. Handle Existing Subscriptions
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        
        // Only cancel if it's a different plan
        if (subscription.metadata.planId !== planId) {
          await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
            metadata: {
              canceled_for_plan_change: 'true',
              new_plan_id: planId,
            },
          });
        } else {
          // If same plan, return existing subscription
          return NextResponse.json({
            message: 'Subscription already exists',
            subscriptionId: subscription.id,
          });
        }
      }
    } catch (error) {
      console.error('Error handling existing subscriptions:', error);
      throw new PaymentError('Failed to process existing subscription');
    }

    // 6. Create Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: SUBSCRIPTION_MODE,
        currency: CURRENCY,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}${SUCCESS_URL}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${CANCEL_URL}`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        metadata: {
          userId: user.id,
          planId: plan.id,
          priceId: stripePriceId,
          period,
          environment: process.env.NODE_ENV,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            planId: plan.id,
            priceId: stripePriceId,
            period,
            environment: process.env.NODE_ENV,
          },
        },
      });

      // Create or update subscription in database
      await prisma.subscription.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: 'pending', // Will be updated by webhook
          status: 'INCOMPLETE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          planId: plan.id,
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: 'pending', // Will be updated by webhook
          status: 'INCOMPLETE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          planId: plan.id,
        },
      });

      // 7. Log the checkout session creation
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'checkout.session.created',
          resource: 'subscription',
          details: {
            sessionId: session.id,
            planId: plan.id,
            priceId: stripePriceId,
            period,
          },
        },
      });

      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new PaymentError('Failed to create checkout session');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    
    if (error instanceof PaymentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 