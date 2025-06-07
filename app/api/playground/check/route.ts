import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

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

    // Check if user has exceeded their limit
    const TIER_LIMITS: Record<PlanType, number | null> = {
      FREE: 20,
      LITE: 300,
      PRO: null, // unlimited
    };

    const limit = TIER_LIMITS[user.planType];
    if (limit !== null && runsThisMonth >= limit) {
      return NextResponse.json({ error: 'Playground run limit exceeded' }, { status: 429 });
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/playground/check:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
