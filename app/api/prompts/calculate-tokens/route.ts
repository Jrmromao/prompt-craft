import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';
import { encode } from 'gpt-tokenizer';

interface TokenCalculationRequest {
  prompt: string;
  model: 'gpt-4' | 'gpt-3.5-turbo';
  estimatedOutputTokens?: number;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: TokenCalculationRequest = await request.json();
    const { prompt, model, estimatedOutputTokens = 200 } = body;

    // Calculate input tokens
    const inputTokens = encode(prompt).length;

    // Get credit service instance
    const creditService = CreditService.getInstance();

    // Calculate credit cost
    const creditCost = creditService.calculateTokenCost(
      inputTokens,
      estimatedOutputTokens,
      model
    );

    return NextResponse.json({
      tokens: {
        input: inputTokens,
        estimatedOutput: estimatedOutputTokens,
        total: inputTokens + estimatedOutputTokens
      },
      cost: {
        credits: creditCost,
        model
      }
    });
  } catch (error) {
    console.error('Error calculating tokens:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tokens' },
      { status: 500 }
    );
  }
} 