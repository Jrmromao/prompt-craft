import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIService } from '@/lib/services/aiService';
import { MetricsService } from '@/lib/services/metricsService';
import { prisma } from '@/lib/prisma';
import { PLANS, PlanType } from '@/app/constants/plans';
import { CreditService } from '@/lib/services/creditService';
import { encode } from 'gpt-tokenizer';

// Export dynamic configuration
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    //   const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);

    //   if (!userDatabaseId) {
    //     return NextResponse.json({ error: 'User database ID not found' }, { status: 404 });
    // }

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planTypeString = user.planType.toUpperCase();
    const planType = Object.values(PlanType).includes(planTypeString as PlanType) 
      ? planTypeString as PlanType 
      : PlanType.FREE;
    const plan = PLANS[planType];
    if (!plan?.features.some(f => f.name === 'Prompt Testing')) {
      return NextResponse.json(
        { error: 'Prompt testing is not available in your current plan. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    // Check test run limit for Pro users
    if (planType === PlanType.PRO) {
      const testRunCount = await prisma.promptTest.count({
        where: {
          promptVersion: {
            userId: user.id
          },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
          }
        }
      });

      if (testRunCount >= 500) { // Pro users get 500 test runs per month
        return NextResponse.json(
          { error: 'You have reached your monthly limit of 500 test runs. Please upgrade to Elite plan for unlimited test runs.' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { content, testInput, promptVersionId, temperature = 0.7, maxTokens = 1000 } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Initialize AI service
    const aiService = AIService.getInstance();

    // Test the prompt
    const result = await aiService.generateText(content, {
      temperature,
      maxTokens,
    });

    // Calculate input and output tokens
    const inputTokenCount = encode(content).length;
    const outputTokenCount = result.tokenCount || 0;
    // Calculate credit cost
    const creditService = CreditService.getInstance();
    let model: 'gpt-4' | 'gpt-3.5-turbo' = 'gpt-4';
    if (result.model === 'gpt-3.5-turbo') {
      model = 'gpt-3.5-turbo';
    }
    const creditCost = creditService.calculateTokenCost(inputTokenCount, outputTokenCount, model);
    // Deduct credits
    const creditDeducted = await creditService.deductCredits(user.id, creditCost, 'USAGE', 'Prompt test');
    if (!creditDeducted) {
      return NextResponse.json({ error: `Insufficient credits to test prompt. Required: ${creditCost}` }, { status: 402 });
    }

    // Track usage using metrics service
    const metricsService = MetricsService.getInstance();
    await metricsService.trackUsage({
      userId: user.id,
      type: 'PROMPT_TEST',
      tokenCount: result.tokenCount,
      metadata: {
        promptLength: content.length,
        temperature,
        maxTokens,
        model: result.model,
      },
    });

    return NextResponse.json({ result: result.text });
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test prompt' },
      { status: 500 }
    );
  }
}