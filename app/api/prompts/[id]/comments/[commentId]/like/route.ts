import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: promptId, commentId } = context.params;
    if (!promptId || !commentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get the database user ID from the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Create or update the like
    const like = await prisma.commentLike.upsert({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: comment.id,
        },
      },
      create: {
        userId: user.id,
        commentId: comment.id,
        promptId: promptId,
      },
      update: {},
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error('[COMMENT_LIKE_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
