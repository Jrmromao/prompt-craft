import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CommentService } from '@/lib/services/commentService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function commentsHandler(request: Request, context?: { params?: Record<string, string> }) {
  try {
    const promptId = context?.params?.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const commentService = CommentService.getInstance();
    const comments = await commentService.getComments(promptId, 1, 100, 'createdAt', 'desc');
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Define the create handler
async function createCommentHandler(
  request: Request,
  context?: { params?: Record<string, string> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = context?.params?.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = commentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { content, parentId } = validationResult.data;
    const commentService = CommentService.getInstance();
    const comment = await commentService.createComment(promptId, userId, content, parentId);
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handlers
export const GET = withDynamicRoute(commentsHandler, fallbackData);
export const POST = withDynamicRoute(createCommentHandler, fallbackData);
