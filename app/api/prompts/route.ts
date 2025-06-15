import { NextRequest, NextResponse } from 'next/server';
import { withPlanLimitsMiddleware } from '@/middleware/withPlanLimits';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';
import { PLANS } from '@/app/constants/plans';

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

      // Check user's plan and private prompt limit
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, planType: true }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // If creating a private prompt, check the limit based on plan
      if (!isPublic) {
        const privatePromptCount = await prisma.prompt.count({
          where: {
            userId: user.id,
            isPublic: false,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
            }
          }
        });

        // Check limits based on plan type
        if (user.planType === PlanType.FREE && privatePromptCount >= 3) {
          return NextResponse.json(
            { error: 'Free users can only create 3 private prompts per month. Please upgrade your plan to create more private prompts.' },
            { status: 403 }
          );
        } else if (user.planType === PlanType.PRO && privatePromptCount >= 50) {
          return NextResponse.json(
            { error: 'Pro users can only create 50 private prompts per month. Please upgrade to Elite plan for unlimited private prompts.' },
            { status: 403 }
          );
        }
      }

      // Create the prompt
      const promptService = PromptService.getInstance();
      const prompt = await promptService.savePrompt(user.id, {
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
        { error: 'Failed to create prompt' },
        { status: 500 }
      );
    }
  }
);
