import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { AnalyticsTrackingService } from '@/lib/services/analyticsTrackingService';
import { PromptService } from '@/lib/services/promptService';

// Use environment variable for API base URL, fallback to localhost
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Track the view
    const analyticsTrackingService = AnalyticsTrackingService.getInstance();
    await analyticsTrackingService.trackPromptView(context.params.id, userId ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking prompt view:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = context.params.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Use AnalyticsService for prompt analytics
    const analyticsService = AnalyticsService.getInstance();
    const analytics = await analyticsService.getAnalytics({ 
      type: 'prompts', 
      userId,
      promptId 
    });
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching prompt analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
