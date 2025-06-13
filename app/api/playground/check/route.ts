import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PlanLimitsService } from '@/lib/services/planLimitsService';
import { dynamicRouteConfig } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptId } = await req.json();

    // Get user's plan type
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, planType: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planLimitsService = PlanLimitsService.getInstance();
    const isTestRunsAvailable = await planLimitsService.isFeatureAvailable(user.planType, 'test_runs');
    
    if (!isTestRunsAvailable) {
      const description = await planLimitsService.getFeatureDescription(user.planType, 'test_runs');
      return NextResponse.json(
        { error: description || 'Test runs are not available in your current plan. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    // Get user's playground runs this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const runsThisMonth = await prisma.playgroundRun.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const { allowed, limit, remaining } = await planLimitsService.checkLimit(
      user.planType,
      'test_runs',
      runsThisMonth
    );

    if (!allowed) {
      return NextResponse.json(
        { 
          error: `You have reached your monthly limit of ${limit} test runs. Please upgrade to continue.`,
          limit,
          remaining
        },
        { status: 403 }
      );
    }

    // If promptId is provided, check if user has access to this prompt
    if (promptId) {
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { isPublic: true, userId: true },
      });

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }

      // Check if user has access to the prompt
      if (!prompt.isPublic && prompt.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized access to prompt' }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      success: true,
      limit,
      remaining
    });
  } catch (error: any) {
    console.error('Error in /api/playground/check:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
