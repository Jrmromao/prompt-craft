import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { PlanType, Period } from '@/utils/constants';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { plan, period } = body;

    if (!plan || !Object.values(PlanType).includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    if (!period || !Object.values(Period).includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period' },
        { status: 400 }
      );
    }

    // Validate plan and period combination
    if (plan === PlanType.PRO && period === Period.WEEKLY) {
      return NextResponse.json(
        { error: 'Pro plan is only available monthly' },
        { status: 400 }
      );
    }

    const subscriptionService = SubscriptionService.getInstance();
    const subscription = await subscriptionService.createSubscription(
      userId,
      plan,
      period
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
} 