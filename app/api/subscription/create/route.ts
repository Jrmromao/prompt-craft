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

    const { planId } = await req.json();

    // Use subscription service to create checkout session
    const { SubscriptionService } = await import('@/lib/services/subscriptionService');
    const service = SubscriptionService.getInstance();
    const url = await service.createCheckoutSession(user.id, planId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
