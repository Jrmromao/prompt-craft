import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsTrackingService } from '@/lib/services/analyticsTrackingService';

export async function POST(request: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = context.params.id;
    const analyticsTrackingService = AnalyticsTrackingService.getInstance();
    await analyticsTrackingService.trackPromptCopy(promptId, userId ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking prompt copy:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
