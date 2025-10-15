import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ApiKeyService } from '@/lib/services/apiKeyService';
import { OpenAIService } from '@/lib/services/openaiService';
import { AnthropicService } from '@/lib/services/anthropicService';
import { trackRunSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { PLANS } from '@/lib/plans';

export async function POST(request: Request) {
  const start = Date.now();
  
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

    // Check monthly run limit
    const plan = PLANS[user.planType as keyof typeof PLANS] || PLANS.FREE;
    if (plan.limits.trackedRuns !== -1) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const runsThisMonth = await prisma.promptRun.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (runsThisMonth >= plan.limits.trackedRuns) {
        return NextResponse.json(
          { 
            error: 'Monthly run limit exceeded',
            limit: plan.limits.trackedRuns,
            used: runsThisMonth,
            message: `Upgrade to track more runs. Current plan: ${plan.name} (${plan.limits.trackedRuns} runs/month)`
          },
          { status: 402 } // Payment Required
        );
      }
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, user.planType);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' }
        }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = trackRunSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { provider, model, input, promptId, temperature, maxTokens, output, tokensUsed, success: runSuccess, error: runError } = validation.data;

    // If this is a tracking request (has output/tokensUsed), save the run
    if (output !== undefined || tokensUsed !== undefined) {
      // Check usage limits
      const { checkUsageLimit } = await import('@/lib/middleware/usageLimits');
      const limitCheck = await checkUsageLimit(user.id);
      
      if (!limitCheck.allowed) {
        return NextResponse.json({ error: limitCheck.error }, { status: 429 });
      }

      const latency = Date.now() - start;
      
      await prisma.promptRun.create({
        data: {
          userId: user.id,
          promptId: promptId || 'unknown',
          provider: provider || 'unknown',
          model: model || 'unknown',
          input,
          output: output || '',
          tokensUsed: tokensUsed || 0,
          cost: calculateCost(provider, model, tokensUsed || 0),
          latency,
          success: runSuccess !== false,
          error: runError,
        },
      });

      return NextResponse.json({ success: true });
    }

    // Otherwise, run the prompt
    if (!provider || !model || !input) {
      return NextResponse.json(
        { error: 'Provider, model, and input required' },
        { status: 400 }
      );
    }

    const apiKey = await ApiKeyService.getApiKey(user.id, provider);
    if (!apiKey) {
      return NextResponse.json(
        { error: `No ${provider} API key connected` },
        { status: 400 }
      );
    }

    let result;
    if (provider === 'openai') {
      const service = new OpenAIService(apiKey);
      result = await service.run(user.id, promptId, input, model, {
        temperature,
        maxTokens,
      });
    } else if (provider === 'anthropic') {
      const service = new AnthropicService(apiKey);
      result = await service.run(user.id, promptId, input, model, {
        temperature,
        maxTokens,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Run prompt error:', error);
    
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.code === 'insufficient_quota' || error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Insufficient API credits. Please add credits to your account.' },
        { status: 402 }
      );
    }

    if (error?.status === 401 || error?.message?.includes('invalid') || error?.message?.includes('authentication')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please reconnect your API key.' },
        { status: 401 }
      );
    }

    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Connection timeout. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to run prompt' },
      { status: 500 }
    );
  }
}

function calculateCost(provider: string, model: string, tokens: number): number {
  // Simplified pricing - uses average of input/output rates
  // Real implementation should track input/output tokens separately
  const pricing: Record<string, Record<string, number>> = {
    openai: {
      'gpt-4': 0.045, // avg of 0.03 input + 0.06 output
      'gpt-4-turbo': 0.02, // avg of 0.01 input + 0.03 output
      'gpt-4-turbo-preview': 0.02,
      'gpt-3.5-turbo': 0.001, // avg of 0.0005 input + 0.0015 output
    },
    anthropic: {
      'claude-3-opus': 0.045, // avg of 0.015 input + 0.075 output
      'claude-3-sonnet': 0.009, // avg of 0.003 input + 0.015 output
      'claude-3-5-sonnet': 0.009,
      'claude-3-haiku': 0.000875, // avg of 0.00025 input + 0.00125 output
    },
    gemini: {
      'gemini-pro': 0.001, // avg of 0.0005 input + 0.0015 output
      'gemini-1.5-pro': 0.003125, // avg of 0.00125 input + 0.005 output
      'gemini-1.5-flash': 0.0001875, // avg of 0.000075 input + 0.0003 output
    },
    grok: {
      'grok-beta': 0.005, // $5 per 1M tokens
    },
  };

  const rate = pricing[provider]?.[model] || 0.001;
  return (tokens / 1000) * rate;
}
