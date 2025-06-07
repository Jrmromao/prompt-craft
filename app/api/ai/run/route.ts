import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendPromptToLLM } from '@/services/aiService';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { PromptPayload } from '@/types/ai';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function runHandler(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

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

    // Run the prompt
    const payload: PromptPayload = {
      content: prompt,
      promptType: 'text',
    };

    const result = await sendPromptToLLM(payload);

    // Record the run
    await prisma.playgroundRun.create({
      data: {
        userId: user.id,
        input: prompt,
        output: result.text,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running prompt:', error);
    return NextResponse.json(
      { error: 'Failed to run prompt' },
      { status: 500 }
    );
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(runHandler, fallbackData);
