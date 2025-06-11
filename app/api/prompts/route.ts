import { NextRequest, NextResponse } from 'next/server';
import { withPlanLimitsMiddleware } from '@/middleware/withPlanLimits';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/prompts
export const GET = withPlanLimitsMiddleware(
  async (req: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const prompts = await prisma.prompt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      );
    }
  }
);

// POST /api/prompts
export const POST = withPlanLimitsMiddleware(
  async (req: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { 
        name,
        description,
        content,
        isPublic,
        tags,
        promptType,
        systemPrompt,
        context,
        examples,
        constraints,
        outputFormat,
        temperature,
        topP,
        frequencyPenalty,
        presencePenalty,
        maxTokens,
        validationRules,
        fallbackStrategy
      } = body;

      if (!name || !content) {
        return NextResponse.json(
          { error: 'Name and content are required' },
          { status: 400 }
        );
      }

      const promptService = PromptService.getInstance();
      const prompt = await promptService.savePrompt(userId, {
        name,
        description,
        content,
        isPublic,
        tags,
        systemPrompt,
        context,
        examples,
        constraints,
        outputFormat,
        temperature,
        topP,
        frequencyPenalty,
        presencePenalty,
        maxTokens,
        validationRules,
        fallbackStrategy
      });

      return NextResponse.json(prompt);
    } catch (error) {
      console.error('Error creating prompt:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create prompt' },
        { status: 500 }
      );
    }
  }
);
