import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // Use GPT-4 to optimize the prompt
    const optimizationPrompt = `You are an expert at optimizing AI prompts for cost efficiency while maintaining quality.

Original prompt: "${prompt}"

Target model: ${targetModel}

Rewrite this prompt to be:
1. More concise (reduce tokens by 50-80%)
2. Clearer and more direct
3. Remove redundant instructions
4. Maintain the same intent and quality

Return ONLY the optimized prompt, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: optimizationPrompt }],
      temperature: 0.3,
    });

    const optimizedPrompt = response.choices[0]?.message?.content?.trim() || prompt;

    // Calculate token reduction
    const originalTokens = Math.ceil(prompt.length / 4);
    const optimizedTokens = Math.ceil(optimizedPrompt.length / 4);
    const tokenReduction = Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100);

    // Calculate cost savings (assuming avg 500 output tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const modelPricing = pricing[targetModel] || pricing['gpt-3.5-turbo'];
    const originalCost = ((originalTokens * modelPricing.input) + (500 * modelPricing.output)) / 1000;
    const optimizedCost = ((optimizedTokens * modelPricing.input) + (500 * modelPricing.output)) / 1000;
    const savings = originalCost - optimizedCost;

    // Save optimization
    await prisma.promptOptimization.create({
      data: {
        userId: user.id,
        originalPrompt: prompt,
        optimizedPrompt,
        tokenReduction,
        estimatedSavings: savings,
        targetModel,
      },
    });

    return NextResponse.json({
      original: prompt,
      optimized: optimizedPrompt,
      tokenReduction,
      originalTokens,
      optimizedTokens,
      estimatedSavings: Math.round(savings * 10000) / 10000,
      qualityScore: 92, // Placeholder - would need actual quality validation
    });
  } catch (error) {
    console.error('Prompt optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize prompt' },
      { status: 500 }
    );
  }
}
