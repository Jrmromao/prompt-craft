import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = commentSchema.parse(body);

    const communityService = CommunityService.getInstance();
    const comment = await communityService.addComment(userId, params.id, content);

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderBy = (searchParams.get('orderBy') || 'desc') as 'asc' | 'desc';

    const communityService = CommunityService.getInstance();
    const result = await communityService.getComments(params.id, {
      page,
      limit,
      orderBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 