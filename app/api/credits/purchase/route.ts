import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/UserService';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { z } from 'zod';
import { CREDIT_PURCHASE_METADATA, STRIPE_API_VERSION } from '@/app/constants/credits';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

const purchaseSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  successUrl: z.string().url('Valid success URL required').optional(),
  cancelUrl: z.string().url('Valid cancel URL required').optional(),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    console.log("Purchase route hit");
    const { userId: clerkId } = await auth();
    console.log("clerkId", clerkId);

    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { success } = await ratelimit.limit(clerkId);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate input
    const body = await req.json();
    const validationResult = purchaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Get user using service
    const userService = UserService.getInstance();
    const user = await userService.getUserByClerkId(clerkId);

    if (!user) {
      console.error("No user found for Clerk ID:", clerkId);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { amount, price } = await req.json();
    if (!amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${amount} Credits`,
              description: `Purchase ${amount} credits for your account`,
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?canceled=true`,
      metadata: {
        type: CREDIT_PURCHASE_METADATA,
        userId: user.id,
        amount: amount.toString(),
      },
    });

    console.log('Created Stripe checkout session:', {
      sessionId: session.id,
      userId: user.id,
      amount,
      price,
    });

    // Log the purchase attempt
    await AuditService.getInstance().logAudit({
      userId: user.id,
      action: 'CREDIT_PURCHASE_ATTEMPTED' as AuditAction,
      resource: 'credits',
      details: {
        amount,
        price,
        sessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}