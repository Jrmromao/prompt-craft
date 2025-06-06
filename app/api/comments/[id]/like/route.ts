import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    const commentId = params.id;

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is missing' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { promptId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const existingLike = await prisma.commentLike.findFirst({
      where: {
        userId,
        commentId,
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ success: true, liked: false });
    } else {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId,
          promptId: comment.promptId,
        },
      });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
