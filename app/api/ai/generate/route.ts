import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AIService } from '@/lib/services/aiService';
import { CreditService } from '@/lib/services/creditService';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { prompt, model = 'deepseek', maxTokens = 1000, temperature = 0.7 } = body;

    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check credit balance
    const requiredCredits = Math.ceil(maxTokens / 100); // 1 credit = 100 tokens
    const creditCheck = await CreditService.getInstance().checkCreditBalance(user.id, requiredCredits);

    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json({
        error: 'Insufficient credits',
        currentCredits: creditCheck.currentCredits,
        requiredCredits: creditCheck.requiredCredits,
        missingCredits: creditCheck.missingCredits,
      }, { status: 402 });
    }

    // Generate text using AI service
    const aiService = AIService.getInstance();
    const generatedText = await aiService.generateText(user.id, {
      prompt,
      model,
      maxTokens,
      temperature,
    });

    

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          decrement: requiredCredits,
        },
      },
    });

    // Record the generation
    await prisma.promptGeneration.create({
      data: {
        userId: user.id,
        promptType: model,
        input: prompt,
        output: generatedText,
        creditsUsed: requiredCredits,
      },
    });

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error('Error generating text:', error);
    
    // Handle specific errors
    if (error.message.includes('access to this model')) {
      return NextResponse.json({
        error: error.message,
        upgradeRequired: true,
      }, { status: 403 });
    }

    return NextResponse.json({
      error: 'Failed to generate text',
    }, { status: 500 });
  }
} 