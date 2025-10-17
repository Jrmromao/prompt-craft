import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeedbackService } from '@/lib/services/feedback.service';
import { FeedbackStatus, FeedbackPriority } from '@prisma/client';
import { z } from 'zod';

const updateFeedbackSchema = z.object({
  status: z.nativeEnum(FeedbackStatus).optional(),
  priority: z.nativeEnum(FeedbackPriority).optional(),
  response: z.string().max(2000).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const feedbackService = FeedbackService.getInstance();
    const feedback = await feedbackService.getFeedback(id);

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Users can only see their own feedback
    if (feedback.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateFeedbackSchema.parse(body);

    const feedbackService = FeedbackService.getInstance();
    
    // Check if feedback exists and user owns it
    const existingFeedback = await feedbackService.getFeedback(id);
    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (existingFeedback.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedFeedback = await feedbackService.updateFeedback(
      id,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
    });
  } catch (error) {
    console.error('Feedback update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
