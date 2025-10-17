import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Map plan IDs to plan types
  const planMap: Record<string, string> = {
    [process.env.STRIPE_STARTER_PRICE_ID!]: 'STARTER',
    [process.env.STRIPE_PRO_PRICE_ID!]: 'PRO',
    [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: 'ENTERPRISE',
  };

  const plan = planMap[planId] || 'FREE';

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    },
    update: {
      planId,
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Subscription created for user ${userId}: ${plan}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSub) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      status: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSub) return;

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      status: 'CANCELED',
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Subscription canceled: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existingSub) return;

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: { 
      status: 'ACTIVE',
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Payment succeeded for subscription: ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existingSub) return;

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: { 
      status: 'PAST_DUE',
      updatedAt: new Date(),
    },
  });

  console.log(`⚠️ Payment failed for subscription: ${subscriptionId}`);
}
