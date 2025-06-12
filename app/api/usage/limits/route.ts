import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription and plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user?.subscription?.plan) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const { plan } = user.subscription;

    // Get current usage for each feature
    const usage = await prisma.usage.groupBy({
      by: ['feature'],
      where: {
        userId,
        timestamp: {
          gte: user.subscription.currentPeriodStart,
          lte: user.subscription.currentPeriodEnd,
        },
      },
      _sum: {
        count: true,
      },
    });

    // Map usage to features
    const usageMap = usage.reduce((acc, curr) => {
      acc[curr.feature] = curr._sum.count || 0;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      plan: {
        name: plan.name,
        features: plan.features,
      },
      usage: usageMap,
      period: {
        start: user.subscription.currentPeriodStart,
        end: user.subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error('Error fetching usage limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    );
  }
} 