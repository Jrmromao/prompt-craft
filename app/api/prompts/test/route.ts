import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIService } from '@/lib/services/aiService';
import { MetricsService } from '@/lib/services/metricsService';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/app/constants/plans';
import { PlanType } from '@prisma/client';

// Export dynamic configuration
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('Test API route called');
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan?.features.some(f => f.name === 'Prompt Testing')) {
      return NextResponse.json(
        { error: 'Prompt testing is not available in your current plan. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    // Check test run limit for Pro users
    if (user.planType === PlanType.PRO) {
      const testRunCount = await prisma.promptTest.count({
        where: {
          promptVersion: {
            userId
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
    console.log('Request body:', body);
    const { content, testInput, promptVersionId, temperature = 0.7, maxTokens = 1000 } = body;

    if (!content) {
      console.log('Missing content');
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Initialize AI service
    const aiService = AIService.getInstance();
    console.log('AI service initialized');

    // Test the prompt
    console.log('Testing prompt...');
    const result = await aiService.generateText(content, {
      temperature,
      maxTokens,
    });
    console.log('Test completed');

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