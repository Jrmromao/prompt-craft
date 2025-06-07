import { NextResponse } from 'next/server';
import { PromptService } from '@/lib/services/promptService';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const promptService = PromptService.getInstance();
    const featuredPrompts = await promptService.getFeaturedPrompts(3);
    return NextResponse.json({ prompts: featuredPrompts });
  } catch (error) {
    console.error('Error fetching featured prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch featured prompts' }, { status: 500 });
  }
}
