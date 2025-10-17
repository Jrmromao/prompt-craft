import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeedbackService } from '@/lib/services/feedback.service';
import { FeedbackType, FeedbackCategory } from '@prisma/client';
import { z } from 'zod';

const createFeedbackSchema = z.object({
  type: z.nativeEnum(FeedbackType),
  category: z.nativeEnum(FeedbackCategory),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  rating: z.number().min(1).max(5).optional(),
  email: z.string().email().optional(),
  url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    
    // Validate input
    const validatedData = createFeedbackSchema.parse(body);
    
    const feedbackService = FeedbackService.getInstance();
    
    const feedback = await feedbackService.createFeedback({
      ...validatedData,
      userId: userId || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      url: validatedData.url || request.headers.get('referer') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Feedback creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as FeedbackType | null;
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const feedbackService = FeedbackService.getInstance();
    
    const feedback = await feedbackService.getAllFeedback({
      userId,
      type: type || undefined,
      status: status || undefined,
      limit,
      offset,
    });

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
