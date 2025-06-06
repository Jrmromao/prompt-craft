import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProfileByClerkId } from '@/app/services/profileService';
import { stripe } from '@/lib/stripe';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await getProfileByClerkId(userId);
  if (!user || !user.stripeCustomerId) {
    return new NextResponse('No Stripe customer', { status: 404 });
  }

  // Fetch subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    limit: 1,
  });
  const subscription = subscriptions.data[0] || null;

  // Fetch invoices
  const invoices = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 10 });

  // Fetch payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card',
  });

  return NextResponse.json({
    subscription,
    invoices: invoices.data,
    paymentMethods: paymentMethods.data,
  });
}
