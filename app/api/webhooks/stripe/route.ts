import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    switch (event.type) {
      case 'checkout.session.completed': {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Update user's subscription
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

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
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

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}