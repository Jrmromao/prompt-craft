import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function promptsHandler(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') === 'true';

  if (featured) {
    try {
      const promptService = PromptService.getInstance();
      const featuredPrompts = await promptService.getFeaturedPrompts(3);
      return NextResponse.json({ prompts: featuredPrompts });
    } catch (error) {
      console.error('Error fetching featured prompts:', error);
      return NextResponse.json({ error: 'Failed to fetch featured prompts' }, { status: 500 });
    }
  }

  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const prompts = await prisma.prompt.findMany({
    where: {
      user: { clerkId: userId },
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return NextResponse.json({ prompts });
}

// Define fallback data
const fallbackData = {
  prompts: [],
};

// Export the wrapped handler
export const GET = withDynamicRoute(promptsHandler, fallbackData);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = body.title || body.name;
    const { content, isPublic, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // 1. Get user and role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, planType: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = user.role as Role;
    const userPlanType = user.planType as PlanType;

    // Always call the LLM API first
    const aiService = AIService.getInstance();
    const llmResult = await aiService.generateText({ userId: user.id, prompt: content });

    let savedPrompt = null;
    if (userRole === Role.ADMIN || userPlanType === PlanType.PRO) {
      const promptService = PromptService.getInstance();
      savedPrompt = await promptService.savePrompt(user.id, {
        name: title,
        content,
        isPublic: isPublic || false,
        tags: tags || [],
      });
    } else if (userPlanType === PlanType.LITE) {
      const promptCount = await prisma.prompt.count({ where: { userId: user.id } });
      if (promptCount < 50) {
        const promptService = PromptService.getInstance();
        savedPrompt = await promptService.savePrompt(user.id, {
          name: title,
          content,
          isPublic: isPublic || false,
          tags: tags || [],
        });
      }
    }

    // Always return the LLM result and savedPrompt (if any)
    return NextResponse.json({
      llmResult,
      savedPrompt,
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}
