import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIService } from '@/lib/services/aiService';
import { CreditService } from '@/lib/services/creditService';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/app/constants/plans';
import { PlanType, CreditType } from '@prisma/client';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    console.log('Generate API route called');
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    const {
      name,
      description,
      promptType,
      systemPrompt,
      context,
      examples,
      constraints,
      outputFormat,
      temperature,
      maxTokens,
    } = body;

    if (!name || !promptType) {
      console.log('Missing required fields:', { name, promptType });
      return NextResponse.json(
        { error: 'Name and prompt type are required' },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Construct the prompt generation request
    const generationPrompt = `Create a professional AI prompt with the following specifications. DO NOT include any introductory text like "Certainly!" or "Here is" at the beginning of your response. Start directly with the prompt content:

Name: ${name}
Purpose: ${promptType}
${description ? `Description: ${description}` : ''}
${systemPrompt ? `System Context: ${systemPrompt}` : ''}
${context ? `Additional Context: ${context}` : ''}
${examples?.length ? `Example Use Cases:\n${examples.join('\n')}` : ''}
${constraints?.length ? `Constraints:\n${constraints.join('\n')}` : ''}
${outputFormat ? `Required Output Format: ${outputFormat}` : ''}

Please generate a complete, well-structured prompt that follows best practices for ${promptType} generation. Include any necessary instructions, context, and formatting requirements. Start your response directly with the prompt content, without any introductory text.`;

    console.log('Generation prompt:', generationPrompt);

    // Initialize AI service
    const aiService = AIService.getInstance();
    console.log('AI service initialized');

    // Calculate credit cost
    const estimatedTokens = Math.ceil(generationPrompt.length / 4); // Rough estimate
    const creditCost = CreditService.getInstance().calculateTokenCost(estimatedTokens, maxTokens || 2000, 'gpt-4');

    // Check if user has enough credits
    const hasEnoughCredits = await CreditService.getInstance().hasEnoughCredits(userId, creditCost);
    if (!hasEnoughCredits) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true }
      });
      
      const plan = PLANS[user?.planType.toUpperCase() as PlanType];
      const errorMessage = plan?.credits.included !== -1 
        ? `Insufficient credits. You need ${creditCost} credits for this operation. Please purchase more credits to continue.`
        : 'This operation is not available in your current plan. Please upgrade to continue.';

      return NextResponse.json(
        { error: errorMessage },
        { status: 402 }
      );
    }

    // Generate the prompt
    console.log('Generating prompt...');
    const generatedPrompt = await aiService.generateText(generationPrompt, {
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 2000,
    });
    console.log('Prompt generated');

    // Deduct credits
    const actualCreditCost = CreditService.getInstance().calculateTokenCost(
      generatedPrompt.tokenCount,
      generatedPrompt.tokenCount,
      'gpt-4'
    );

    const creditsDeducted = await CreditService.getInstance().deductCredits(
      userId,
      actualCreditCost,
      CreditType.USAGE,
      `Generated prompt: ${name}`
    );

    if (!creditsDeducted) {
      return NextResponse.json(
        { error: 'Failed to deduct credits. Please try again.' },
        { status: 500 }
      );
    }

    // Post-process the generated prompt to remove any introductory text
    let processedPrompt = generatedPrompt.text;
    const introPatterns = [
      /^Certainly!.*?\n/,
      /^Here is.*?\n/,
      /^Below is.*?\n/,
      /^I'll create.*?\n/,
      /^I will create.*?\n/,
      /^Here's.*?\n/,
      /^Here's a.*?\n/,
      /^Here is a.*?\n/,
      /^I have created.*?\n/,
      /^I've created.*?\n/
    ];

    for (const pattern of introPatterns) {
      processedPrompt = processedPrompt.replace(pattern, '');
    }

    return NextResponse.json({ 
      generatedPrompt: processedPrompt,
      metadata: {
        name,
        description,
        promptType,
        systemPrompt,
        context,
        examples,
        constraints,
        outputFormat,
        temperature,
        maxTokens,
        tokenCount: generatedPrompt.tokenCount,
        model: generatedPrompt.model,
        creditsUsed: actualCreditCost
      }
    });
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate prompt' },
      { status: 500 }
    );
  }
} 