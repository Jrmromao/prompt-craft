import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';

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
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, content, isPublic, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const promptService = PromptService.getInstance();
    const prompt = await promptService.savePrompt(userId, {
      name: title,
      content,
      isPublic: isPublic || false,
      tags: tags || [],
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
} 