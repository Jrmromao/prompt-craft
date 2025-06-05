import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { z } from 'zod';

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
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
    const { value } = voteSchema.parse(body);

    const communityService = CommunityService.getInstance();
    const result = await communityService.votePrompt(userId, params.id, value);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error voting on prompt:', error);
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const communityService = CommunityService.getInstance();
    const vote = await communityService.getUserVote(userId, params.id);

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error getting user vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 