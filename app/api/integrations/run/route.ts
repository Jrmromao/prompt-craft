import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkAISpendLimit } from '@/lib/middleware/planLimits';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check AI spend limit
    const spendCheck = await checkAISpendLimit(user.id);
    if (!spendCheck.allowed) {
      return NextResponse.json(
        {
          error: 'LIMIT_EXCEEDED',
          message: spendCheck.reason,
          currentSpend: spendCheck.currentSpend,
          limit: spendCheck.limit,
          upgradeUrl: '/pricing',
        },
        { status: 402 } // Payment Required
      );
    }

    const data = await req.json();

    // Calculate cost if not provided
    let cost = 0;
    if (data.tokensUsed && data.model) {
      // Rough cost estimation
      const costPerToken = 0.00001; // $0.01 per 1000 tokens
      cost = data.tokensUsed * costPerToken;
    }

    // Track the run
    const run = await prisma.promptRun.create({
      data: {
        userId: user.id,
        provider: data.provider,
        model: data.model,
        requestedModel: data.requestedModel || data.model,
        input: data.input,
        output: data.output,
        tokensUsed: data.tokensUsed || (data.inputTokens || 0) + (data.outputTokens || 0),
        inputTokens: data.inputTokens || 0,
        outputTokens: data.outputTokens || 0,
        cost: cost,
        latency: data.latency,
        success: data.success,
        error: data.error,
      },
    });

    // Check if user is approaching limit (80%)
    if (spendCheck.percentUsed >= 80 && spendCheck.percentUsed < 100) {
      return NextResponse.json({
        success: true,
        run,
        warning: {
          message: `You've used ${spendCheck.percentUsed.toFixed(0)}% of your monthly AI spend limit`,
          currentSpend: spendCheck.currentSpend,
          limit: spendCheck.limit,
          upgradeUrl: '/pricing',
        },
      });
    }

    return NextResponse.json({ success: true, run });
  } catch (error) {
    console.error('Error tracking run:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
