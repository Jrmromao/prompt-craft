import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        Subscription: {
          include: {
            Plan: true
          }
        }
      }
    });

    if (!user || !user.Subscription) {
      return NextResponse.json({
        status: 'INACTIVE',
        planName: 'Free Plan',
        currentPeriodEnd: null
      });
    }

    return NextResponse.json({
      status: user.Subscription.status,
      planName: user.Subscription.Plan.name,
      currentPeriodEnd: user.Subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.Subscription.cancelAtPeriodEnd
    });
  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
