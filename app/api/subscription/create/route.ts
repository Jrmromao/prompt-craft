import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { StripeService } from '@/lib/services/stripe/stripeService';
import { StripeCheckoutError } from '@/lib/services/stripe/errors';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan) {
      return new NextResponse('Plan is required', { status: 400 });
    }

    // Get the user from our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get the plan from our database
    const planData = await prisma.plan.findFirst({
      where: { name: plan },
    });

    if (!planData) {
      return new NextResponse('Plan not found', { status: 404 });
    }

    const stripeService = StripeService.getInstance();

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        email: user.email,
        userId: user.id,
        clerkId: user.clerkId,
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      customerId,
      planId: planData.stripeProductId,
      userId: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    if (!session.url) {
      throw new StripeCheckoutError('Failed to create checkout session');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription creation error:', error);
    if (error instanceof StripeCheckoutError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
