import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeedbackService } from '@/lib/services/feedback.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createFeedbackSchema = z.object({
  type: z.enum(['BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL_FEEDBACK', 'COMPLAINT', 'COMPLIMENT', 'QUESTION', 'SUGGESTION']),
  category: z.enum(['UI_UX', 'PERFORMANCE', 'BILLING', 'API', 'DOCUMENTATION', 'SECURITY', 'INTEGRATION', 'OTHER']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  rating: z.number().min(1).max(5).optional(),
  email: z.string().email().optional().or(z.literal('')),
  url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Check if body exists
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      );
    }
    
    // Validate input
    const validatedData = createFeedbackSchema.parse(body);
    
    const feedbackService = FeedbackService.getInstance();
    
    // Only include userId if user is authenticated and exists
    let finalUserId = undefined;
    if (userId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { id: true }
        });
        if (userExists) {
          finalUserId = userExists.id;
        }
      } catch (error) {
        // User lookup failed, create anonymous feedback
      }
    }
    
    const feedback = await feedbackService.createFeedback({
      ...validatedData,
      email: validatedData.email || undefined,
      userId: finalUserId,
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const feedbackService = FeedbackService.getInstance();
    
    const feedback = await feedbackService.getAllFeedback({
      userId,
      type: type as any || undefined,
      status: status as any || undefined,
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
