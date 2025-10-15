import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ApiKeyService } from '@/lib/services/apiKeyService';
import { OpenAIService } from '@/lib/services/openaiService';
import { AnthropicService } from '@/lib/services/anthropicService';

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

    const body = await request.json();
    const { provider, model, input, promptId, temperature, maxTokens, output, tokensUsed, success: runSuccess, error: runError } = body;

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
  const pricing: Record<string, Record<string, number>> = {
    openai: {
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.0005,
    },
    anthropic: {
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003,
      'claude-3-haiku': 0.00025,
    },
  };

  const rate = pricing[provider]?.[model] || 0.001;
  return (tokens / 1000) * rate;
}
