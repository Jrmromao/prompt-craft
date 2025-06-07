import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(
  req: Request,
  context: { params: Promise<{ subscriptionId: string }> }
): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { subscriptionId } = await context.params;

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      return new Response('Subscription not found', { status: 404 });
    }

    // Verify ownership
    if (subscription.user.clerkId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
