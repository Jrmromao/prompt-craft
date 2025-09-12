import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OnboardingService } from '@/lib/services/OnboardingService';
import { z } from 'zod';

const trackStepSchema = z.object({
  step: z.string().min(1),
  completed: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = trackStepSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { step, completed, metadata } = validationResult.data;
    const onboardingService = OnboardingService.getInstance();
    
    await onboardingService.trackStep(userId, step, completed, metadata);

    return NextResponse.json({
      success: true,
      data: {
        step,
        completed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error tracking onboarding step:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track onboarding step' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingService = OnboardingService.getInstance();
    const progress = await onboardingService.getProgress(userId);
    const isCompleted = await onboardingService.isCompleted(userId);

    return NextResponse.json({
      success: true,
      data: {
        progress,
        isCompleted,
      },
    });
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get onboarding progress' },
      { status: 500 }
    );
  }
}
