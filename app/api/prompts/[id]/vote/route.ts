import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

// @ts-ignore
export async function POST(request: NextRequest, { params }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID from the Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { value } = voteSchema.parse(body);
    const { id } = params;

    const communityService = CommunityService.getInstance();
    const result = await communityService.votePrompt(user.id, id, value);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error voting on prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID from the Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const communityService = CommunityService.getInstance();
    const vote = await communityService.getUserVote(user.id, id);

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error getting user vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
