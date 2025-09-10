import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptOptimizationService } from '@/lib/services/promptOptimizationService';
import { CreditService } from '@/lib/services/creditService';
import { calculateCreditCost } from '@/app/constants/creditCosts';
import { prisma } from '@/lib/prisma';
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

    // Get user's plan type for credit calculation
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, planType: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { userIdea, requirements, targetAudience, promptType, tone } = body;

    if (!userIdea || userIdea.length < 10) {
      return NextResponse.json(
        { success: false, error: 'User idea must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Calculate credit cost based on user's plan
    const creditCost = calculateCreditCost('PROMPT_OPTIMIZATION', user.planType);
    
    // Check if user has enough credits
    const creditService = CreditService.getInstance();
    const hasEnoughCredits = await creditService.hasEnoughCredits(user.id, creditCost);
    
    if (!hasEnoughCredits) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient credits. This operation requires ${creditCost} credits.`,
          requiredCredits: creditCost
        },
        { status: 402 }
      );
    }

    const optimizationService = PromptOptimizationService.getInstance();
    
    const result = await optimizationService.optimizePrompt({
      userIdea,
      requirements,
      targetAudience,
      promptType,
      tone,
      userId: user.id
    });

    // Deduct credits after successful optimization
    await creditService.deductCredits(
      user.id, 
      creditCost, 
      'USAGE', 
      'Prompt optimization'
    );

    return NextResponse.json({
      success: true,
      data: result,
      creditsUsed: creditCost
    });

  } catch (error) {
    Sentry.captureException(error);
    
    const errorMessage = error instanceof Error ? error.message : 'Optimization failed';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
