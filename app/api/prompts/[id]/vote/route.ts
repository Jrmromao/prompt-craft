import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { PlanService } from '@/lib/services/planService';
import { CreditService } from '@/lib/services/creditService';
import { PlanType } from '@/app/constants/plans';
import { CreditType } from '@prisma/client';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  context: any
) {
  try {
    const { userId: clerkUserId } = await auth();
    const promptId = context.params.id;

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the vote
    const vote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        promptId
      }
    });

    return NextResponse.json({
      vote: vote ? vote.value : null
    });
  } catch (error) {
    console.error('Error fetching user vote:', error);
    
    // Handle Prisma connection errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1017') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: any
) {
  try {
    const { userId: clerkUserId } = await auth();
    const promptId = context.params.id;

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { value } = body;

    if (typeof value !== 'number' || (value !== 1 && value !== -1)) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      );
    }

    // Get the database user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the prompt and its creator
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { userId: true }
    });
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Prevent self-upvotes from awarding credits
    const isSelfUpvote = prompt.userId === user.id;

    // Check if this is the first upvote from this user on this prompt
    const existingVote = await prisma.vote.findUnique({
      where: { userId_promptId: { userId: user.id, promptId } }
    });
    const isFirstUpvote = !existingVote;

    // Upsert the vote
    const vote = await prisma.vote.upsert({
      where: {
        userId_promptId: {
          userId: user.id,
          promptId
        }
      },
      update: {
        value
      },
      create: {
        userId: user.id,
        promptId,
        value
      }
    });

    // Award credits if:
    // - Upvote (value === 1)
    // - Not a self-upvote
    // - First upvote from this user
    // - Upvoter is Pro or Elite
    let creditsAwarded = 0;
    if (value === 1 && !isSelfUpvote && isFirstUpvote) {
      const upvoterPlan = await PlanService.getUserPlan(user.id);
      if (upvoterPlan.id === PlanType.PRO) {
        await CreditService.getInstance().addCredits(prompt.userId, 1, CreditType.UPVOTE);
        creditsAwarded = 1;
      } else if (upvoterPlan.id === PlanType.ELITE) {
        await CreditService.getInstance().addCredits(prompt.userId, 2, CreditType.UPVOTE);
        creditsAwarded = 2;
      }
    }

    return NextResponse.json({ vote, creditsAwarded });
  } catch (error) {
    console.error('Error creating/updating vote:', error);
    // Handle Prisma connection errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1017') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create/update vote' },
      { status: 500 }
    );
  }
}
