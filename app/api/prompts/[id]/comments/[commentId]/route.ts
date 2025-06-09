import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: promptId, commentId } = context.params;
    if (!promptId || !commentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('[COMMENT_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: promptId, commentId } = context.params;
    if (!promptId || !commentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get the database user ID from the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId: user.id,
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('[COMMENT_PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
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

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId: user.id,
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[COMMENT_DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
