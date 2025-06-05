import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommentService } from '@/lib/services/commentService';

export async function DELETE(
  request: NextRequest,
  // @ts-ignore
  { params }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const commentId = params.commentId;
    const commentService = CommentService.getInstance();
    await commentService.deleteComment(commentId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 