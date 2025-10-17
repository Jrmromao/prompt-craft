import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { optimizePrompt } from '@/lib/services/promptOptimizer';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check usage limits for free tier
    if (user.planType === 'FREE') {
      const count = await prisma.promptRun.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (count >= 1000) {
        return NextResponse.json(
          { error: 'Monthly limit reached. Upgrade to continue.' },
          { status: 429 }
        );
      }
    }

    const result = await optimizePrompt(prompt);

    // Save optimization to database
    await prisma.promptOptimization.create({
      data: {
        userId: user.id,
        originalPrompt: result.original,
        optimizedPrompt: result.optimized,
        tokenReduction: result.tokensSaved,
        estimatedSavings: result.costSaved,
        targetModel: 'gpt-4',
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });
  }
}
