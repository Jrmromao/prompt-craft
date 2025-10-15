import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AICostOptimizer } from '@/lib/services/aiCostOptimizer';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has Pro plan or free trial
    const optimizationCount = await prisma.promptOptimization.count({
      where: { userId: user.id },
    });

    if (user.planType === 'FREE' && optimizationCount >= 3) {
      return NextResponse.json(
        { error: 'Free plan limited to 3 optimizations. Upgrade to Pro for unlimited.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, targetModel = 'gpt-3.5-turbo' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Use real AI optimizer
    const result = await AICostOptimizer.optimizePrompt(prompt, targetModel);

    // Save optimization
    await prisma.promptOptimization.create({
      data: {
        userId: user.id,
        originalPrompt: result.original,
        optimizedPrompt: result.optimized,
        tokenReduction: result.tokenReduction,
        estimatedSavings: result.estimatedSavings,
        targetModel,
      },
    });

    return NextResponse.json({
      original: result.original,
      optimized: result.optimized,
      tokenReduction: result.tokenReduction,
      originalTokens: result.originalTokens,
      optimizedTokens: result.optimizedTokens,
      estimatedSavings: result.estimatedSavings,
      qualityScore: result.quality,
    });
  } catch (error) {
    console.error('Prompt optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize prompt' },
      { status: 500 }
    );
  }
}
