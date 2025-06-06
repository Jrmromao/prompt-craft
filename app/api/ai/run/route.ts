import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendPromptToLLM } from '@/services/aiService';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { PromptPayload } from '@/types/ai';

export async function POST(req: Request) {
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
      select: { id: true, planType: true }
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
          gte: startOfMonth
        }
      }
    });

    // Check if user has exceeded their limit
    const TIER_LIMITS: Record<PlanType, number | null> = {
      FREE: 20,
      LITE: 300,
      PRO: null, // unlimited
    };

    const limit = TIER_LIMITS[user.planType];
    if (limit !== null && runsThisMonth >= limit) {
      return NextResponse.json(
        { error: 'Playground run limit exceeded' },
        { status: 429 }
      );
    }

    // Run the prompt
    const payload: PromptPayload = {
      content: prompt,
      promptType: 'text'
    };
    try {
      const result = await sendPromptToLLM(payload);
      
      // Record the playground run
      await prisma.playgroundRun.create({
        data: {
          userId: user.id,
          input: prompt,
          output: result || null
        }
      });

      return NextResponse.json({ result });
    } catch (error: any) {
      console.error('Error running prompt:', error);
      
      // Handle specific errors
      if (error.message?.includes('Insufficient credits')) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please purchase more credits to continue.' },
          { status: 402 }
        );
      }
      if (error.message?.includes('upgrade')) {
        return NextResponse.json(
          { error: 'This feature requires a Pro subscription. Please upgrade to continue.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in /api/ai/run:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 