import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QualityAwareRouter } from '@/lib/services/qualityAwareRouter';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      originalModel, 
      selectedModel, 
      qualityRating, 
      wasHelpful 
    } = await request.json();

    if (!originalModel || !selectedModel || qualityRating === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await QualityAwareRouter.recordFeedback(
      userId,
      originalModel,
      selectedModel,
      qualityRating,
      wasHelpful
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}
