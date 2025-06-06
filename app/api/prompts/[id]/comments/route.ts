import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CommentService } from '@/lib/services/commentService';

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  // @ts-ignore
  { params }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    const promptId = params.id as string;
    const commentService = CommentService.getInstance();
    const comment = await commentService.createComment(
      promptId,
      userId,
      validatedData.content,
      validatedData.parentId
    );

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  // @ts-ignore
  { params }
) {
  try {
    const promptId = params.id as string;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const commentService = CommentService.getInstance();
    const comments = await commentService.getComments(
      promptId,
      page,
      limit,
      orderBy,
      order as 'asc' | 'desc'
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
