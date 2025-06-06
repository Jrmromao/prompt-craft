import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analyticsService';

export async function POST(request: NextRequest) {
  try {
    // Extract promptId from the URL
    const url = new URL(request.url);
    const match = url.pathname.match(/prompts\/(.+?)\/copy/);
    const promptId = match?.[1];
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }
    const { userId } = await auth();
    const analyticsService = AnalyticsService.getInstance();
    await analyticsService.trackPromptCopy(promptId, userId ?? undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking prompt copy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 