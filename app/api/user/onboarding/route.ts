import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const onboardingSchema = z.object({
  step: z.string().min(1),
  completed: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, completed, metadata } = onboardingSchema.parse(body);

    // Update or create onboarding progress
    await prisma.userOnboarding.upsert({
      where: {
        userId_step: {
          userId,
          step,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        metadata,
      },
      create: {
        userId,
        step,
        completed,
        completedAt: completed ? new Date() : null,
        metadata,
      },
    });

    // If this step is completed, check if all onboarding is done
    if (completed) {
      const allSteps = await prisma.userOnboarding.findMany({
        where: { userId },
      });

      const requiredSteps = ['create', 'explore'];
      const completedSteps = allSteps.filter(s => s.completed).map(s => s.step);
      const isOnboardingComplete = requiredSteps.every(step => completedSteps.includes(step));

      if (isOnboardingComplete) {
        // Update user's onboarding status
        await prisma.user.update({
          where: { id: userId },
          data: { 
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        step,
        completed,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Onboarding tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track onboarding progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const onboardingProgress = await prisma.userOnboarding.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        onboardingCompletedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        steps: onboardingProgress,
        isComplete: user?.onboardingCompleted || false,
        completedAt: user?.onboardingCompletedAt,
      },
    });

  } catch (error) {
    console.error('Get onboarding progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get onboarding progress' },
      { status: 500 }
    );
  }
}
