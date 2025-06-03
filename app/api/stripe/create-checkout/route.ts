import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {


    console.log('Creating checkout session');
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the plan from our database
    const planData = await prisma.plan.findFirst({
      where: { name: plan }
    });

    if (!planData) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
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
              interval: planData.period.toLowerCase() === 'weekly' ? 'week' : 'month',
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
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}