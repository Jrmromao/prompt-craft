import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { packageId } = await req.json();

    // Get credit package
    const pkg = await prisma.creditPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return new NextResponse('Package not found', { status: 404 });
    }

    // Create Stripe checkout session for one-time payment
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: pkg.description || undefined,
          },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?credits=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        credits: pkg.amount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating credit purchase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
