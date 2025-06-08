import { NextResponse } from 'next/server';
import { PromptService } from '@/lib/services/promptService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const promptService = PromptService.getInstance();
    const { prompts, total } = await promptService.getPublicPrompts(page, limit);

    return NextResponse.json({ prompts, total });
  } catch (error) {
    console.error('Error fetching public prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
} 