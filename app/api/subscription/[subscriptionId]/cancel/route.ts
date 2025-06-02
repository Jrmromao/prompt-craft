import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(
  req: Request,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { subscriptionId } = params;

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      return new NextResponse('Subscription not found', { status: 404 });
    }

    // Verify ownership
    if (subscription.user.clerkId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 