import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptOptimizationService } from '@/lib/services/promptOptimizationService';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { userIdea, requirements, promptType, tone } = await request.json();

    if (!userIdea) {
      return NextResponse.json({ error: 'User idea is required' }, { status: 400 });
    }

    const optimizationService = PromptOptimizationService.getInstance();
    
    const result = await optimizationService.optimizePrompt({
      userIdea,
      requirements: requirements || '',
      promptType: promptType || 'conversational',
      tone: tone || 'professional',
      userId: user.id // Use database user ID
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error optimizing prompt:', error);
    
    if (error.message.includes('Insufficient credits')) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
