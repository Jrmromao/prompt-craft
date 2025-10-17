import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeedbackService } from '@/lib/services/feedback.service';
import { FeedbackType, FeedbackStatus, FeedbackPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as FeedbackType | null;
    const status = searchParams.get('status') as FeedbackStatus | null;
    const priority = searchParams.get('priority') as FeedbackPriority | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const feedbackService = FeedbackService.getInstance();
    
    const [feedback, stats] = await Promise.all([
      feedbackService.getAllFeedback({
        type: type || undefined,
        status: status || undefined,
        priority: priority || undefined,
        limit,
        offset,
      }),
      feedbackService.getFeedbackStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        stats,
        pagination: {
          limit,
          offset,
          hasMore: feedback.length === limit,
        },
      },
    });
  } catch (error) {
    console.error('Admin feedback fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
