import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

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
        
        // Create subscription in database
        await prisma.subscription.create({
          data: {
            userId: session.metadata?.userId!,
            planId: session.metadata?.planId!,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: subscription.status.toUpperCase() as any,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Update user's credits
        const plan = await prisma.plan.findUnique({
          where: { id: session.metadata?.planId },
        });

        if (plan) {
          await prisma.user.update({
            where: { id: session.metadata?.userId },
            data: {
              credits: plan.credits,
              creditCap: plan.creditCap,
              role: plan.type,
            },
          });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status.toUpperCase() as any,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
          },
        });

        // Reset user to free tier
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          include: { user: true },
        });

        if (dbSubscription) {
          await prisma.user.update({
            where: { id: dbSubscription.userId },
            data: {
              role: 'FREE',
              credits: 10,
              creditCap: 10,
            },
          });
        }

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}