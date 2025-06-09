import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { prisma } from '@/lib/prisma';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const promptId = context?.params?.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const communityService = CommunityService.getInstance();
    const vote = await communityService.getUserVote(user.id, promptId);
    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const promptId = context?.params?.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const { value } = await request.json();
    if (value === undefined) {
      return NextResponse.json({ error: 'Vote value is required' }, { status: 400 });
    }

    const communityService = CommunityService.getInstance();
    const result = await communityService.votePrompt(user.id, promptId, value);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
