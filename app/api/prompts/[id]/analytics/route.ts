import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { AnalyticsTrackingService } from '@/lib/services/analyticsTrackingService';

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

export async function GET(request: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyticsService = AnalyticsService.getInstance();
    const analytics = await analyticsService.getPromptAnalytics(context.params.id);

    if (!analytics) {
      return NextResponse.json({ error: 'Analytics not found' }, { status: 404 });
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error getting prompt analytics:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
