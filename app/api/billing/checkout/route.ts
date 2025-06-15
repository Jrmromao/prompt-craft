import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();
    console.log('Received checkout request:', { priceId, userId });

    if (!priceId) {
      console.error('Price ID is missing');
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get user's profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the base URL from the request headers
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = req.headers.get('host') || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;

    console.log('Creating checkout session with base URL:', baseUrl);

    // Create or get Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      const plan = await prisma.plan.findUnique({
        where: { id: 'free' },
      });

      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscription: {
            create: {
              stripeCustomerId: customerId,
              status: SubscriptionStatus.INCOMPLETE,
              stripeSubscriptionId: 'pending',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(),
              planId: plan?.id,
            },
          },
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        userId,
        priceId,
      },
    });

    // Audit log for subscription checkout creation
    await AuditService.getInstance().logAudit({
      action: AuditAction.SUBSCRIPTION_CHECKOUT_CREATED,
      userId,
      resource: 'subscription',
      details: { priceId, customerId, sessionId: session.id },
    });

    console.log('Created checkout session:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 