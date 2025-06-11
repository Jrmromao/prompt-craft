import { NextRequest, NextResponse } from 'next/server';
import { withPlanLimitsMiddleware } from '@/middleware/withPlanLimits';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      const { title, content, type } = body;

      if (!title || !content || !type) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const prompt = await prisma.prompt.create({
        data: {
          name: title,
          content,
          promptType: type,
          userId,
          slug: title.toLowerCase().replace(/\s+/g, '-')
        }
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
