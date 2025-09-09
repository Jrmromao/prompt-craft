import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptOptimizationService } from '@/lib/services/promptOptimizationService';
import * as Sentry from '@sentry/nextjs';

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
    const { basePrompt, count = 3 } = body;

    if (!basePrompt) {
      return NextResponse.json(
        { success: false, error: 'Base prompt is required' },
        { status: 400 }
      );
    }

    if (count < 1 || count > 5) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 5' },
        { status: 400 }
      );
    }

    const optimizationService = PromptOptimizationService.getInstance();
    
    const variations = await optimizationService.generatePromptVariations(
      basePrompt,
      userId,
      count
    );

    return NextResponse.json({
      success: true,
      data: {
        variations,
        creditsUsed: count * 2
      }
    });

  } catch (error) {
    Sentry.captureException(error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate variations';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
