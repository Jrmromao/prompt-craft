import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/prisma';
import { Role } from '@/utils/constants';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includePublic = searchParams.get('includePublic') === 'true';
    const tags = searchParams.get('tags')?.split(',') || [];
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const promptService = PromptService.getInstance();
    const result = await promptService.getPrompts(userId, {
      includePublic,
      tags,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = body.title || body.name;
    const { content, isPublic, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // 1. Get user and role
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const userRole = user.role as Role;

    // Always call the LLM API first
    const aiService = AIService.getInstance();
    const llmResult = await aiService.generateText(user.id, {
      prompt: content,
    });

    let savedPrompt = null;
    if (userRole === Role.PRO || userRole === Role.ADMIN) {
      const promptService = PromptService.getInstance();
      savedPrompt = await promptService.savePrompt(user.id, {
        name: title,
        content,
        isPublic: isPublic || false,
        tags: tags || [],
        metadata: { llmResult },
      });
    } else if (userRole === Role.LITE) {
      const promptCount = await prisma.prompt.count({ where: { userId: user.id } });
      if (promptCount < 50) {
    const promptService = PromptService.getInstance();
        savedPrompt = await promptService.savePrompt(user.id, {
      name: title,
      content,
      isPublic: isPublic || false,
      tags: tags || [],
          metadata: { llmResult },
    });
      }
    }

    // Always return the LLM result and savedPrompt (if any)
    return NextResponse.json({
      llmResult,
      savedPrompt,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('prompt limit')) {
      return NextResponse.json(
        { error: err.message },
        { status: 403 }
      );
    }
    console.error('Error saving prompt:', err);
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
}

export async function GET_FEATURED_PROMPTS() {
  try {
    const promptService = PromptService.getInstance();
    const featuredPrompts = await promptService.getFeaturedPrompts(3);
    return NextResponse.json({ prompts: featuredPrompts });
  } catch (error) {
    console.error('Error fetching featured prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured prompts' },
      { status: 500 }
    );
  }
} 