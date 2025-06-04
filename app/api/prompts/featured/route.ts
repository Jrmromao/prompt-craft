import { NextResponse } from 'next/server';
import { PromptService } from '@/lib/services/promptService';

export async function GET() {
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