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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, completed, metadata } = onboardingSchema.parse(body);

    // For now, just return success since onboarding tracking is not implemented in the database
    // TODO: Implement UserOnboarding model and onboarding fields in User model
    console.log('Onboarding step tracked:', { userId, step, completed, metadata });

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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, return empty onboarding progress since it's not implemented in the database
    // TODO: Implement UserOnboarding model and onboarding fields in User model
    return NextResponse.json({
      success: true,
      data: {
        steps: [],
        isComplete: false,
        completedAt: null,
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
