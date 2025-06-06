import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProfileByClerkId } from '@/app/services/profileService';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const user = await getProfileByClerkId(userId);
  if (!user || !user.stripeCustomerId) {
    return new NextResponse('No Stripe customer', { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: process.env.NEXT_PUBLIC_APP_URL + '/profile?tab=billing',
  });

  return NextResponse.json({ url: portalSession.url });
}
