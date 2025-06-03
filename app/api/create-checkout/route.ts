// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

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
            plan: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get the plan from our database
    const planData = await prisma.plan.findFirst({
      where: { name: plan }
    });

    if (!planData) {
      return new NextResponse('Plan not found', { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: user.clerkId,
        },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planData.name,
              description: `${planData.credits} credits per ${planData.period.toLowerCase()}`,
            },
            unit_amount: Math.round(planData.price * 100), // Convert to cents
            recurring: {
              interval: planData.period.toLowerCase() as 'week' | 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planData.id,
      },
    });

    if (!session.url) {
      return new NextResponse('Failed to create checkout session', { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}