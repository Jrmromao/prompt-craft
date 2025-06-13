import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PlanLimitsService } from '@/lib/services/planLimitsService';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription and plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        subscription: {
          select: {
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const planLimitsService = PlanLimitsService.getInstance();

    // Get current usage for each feature
    const features = ['prompt_creation', 'test_runs', 'version_control', 'private_prompts'];
    const usage = await prisma.usage.groupBy({
      by: ['feature'],
      where: {
        userId,
        timestamp: {
          gte: user.subscription?.currentPeriodStart || new Date(),
          lte: user.subscription?.currentPeriodEnd || new Date(),
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

    // Get limits and descriptions for each feature
    const limits = await Promise.all(
      features.map(async (feature) => {
        const limit = await planLimitsService.getFeatureLimit(user.planType, feature);
        const description = await planLimitsService.getFeatureDescription(user.planType, feature);
        const currentUsage = usageMap[feature] || 0;
        const { remaining } = await planLimitsService.checkLimit(user.planType, feature, currentUsage);
        return {
          feature,
          limit,
          description,
          currentUsage,
          remaining
        };
      })
    );

    return NextResponse.json({
      plan: {
        type: user.planType,
        features: limits.reduce((acc, { feature, limit, description, currentUsage, remaining }) => {
          acc[feature] = { limit, description, currentUsage, remaining };
          return acc;
        }, {} as Record<string, { limit: number; description: string | null; currentUsage: number; remaining: number }>)
      },
      period: {
        start: user.subscription?.currentPeriodStart || new Date(),
        end: user.subscription?.currentPeriodEnd || new Date(),
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