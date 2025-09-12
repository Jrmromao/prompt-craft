import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { VoteRewardService } from '@/lib/services/voteRewardService';
import { UserService } from '@/lib/services/UserService';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

const voteSchema = z.object({
  value: z.number().int().min(-1).max(1),
});

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  context: any
) {
  try {
    const { userId: clerkUserId } = await auth();
    const params = await context.params;
    const promptId = params.id;

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const { success } = await ratelimit.limit(clerkUserId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get the database user ID using service
    const userService = UserService.getInstance();
    const user = await userService.getUserByClerkId(clerkUserId);
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
    const params = await context.params;
    const promptId = params.id;

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

    // Get IP address and user agent for anti-abuse tracking
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     headersList.get('cf-connecting-ip') || 
                     undefined;
    const userAgent = headersList.get('user-agent') || undefined;

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

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: { userId_promptId: { userId: user.id, promptId } }
    });

    const isFirstVote = !existingVote;
    const isChangingVote = existingVote && existingVote.value !== value;

    // Process the vote using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upsert the vote
      const vote = await tx.vote.upsert({
        where: {
          userId_promptId: {
            userId: user.id,
            promptId
          }
        },
        update: {
          value,
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          promptId,
          value
        }
      });

      // Update prompt upvotes count
      if (isFirstVote) {
        // New vote
        await tx.prompt.update({
          where: { id: promptId },
          data: { upvotes: { increment: value } }
        });
      } else if (isChangingVote) {
        // Changing vote (e.g., from downvote to upvote or vice versa)
        const increment = value - existingVote.value; // Will be +2 or -2
        await tx.prompt.update({
          where: { id: promptId },
          data: { upvotes: { increment } }
        });
      } else {
        // Removing vote (clicking same vote again)
        await tx.prompt.update({
          where: { id: promptId },
          data: { upvotes: { decrement: existingVote.value } }
        });
        
        // Delete the vote
        await tx.vote.delete({
          where: { id: vote.id }
        });
        
        return { vote: null, creditsAwarded: 0 };
      }

      return { vote, creditsAwarded: 0 };
    });

    // Process credit rewards only for new upvotes using the anti-abuse system
    let creditsAwarded = 0;
    if (value === 1 && (isFirstVote || isChangingVote) && result.vote) {
      const voteRewardService = VoteRewardService.getInstance();
      const rewardResult = await voteRewardService.processVoteReward(
        result.vote.id,
        user.id,
        prompt.userId,
        promptId,
        value,
        ipAddress,
        userAgent
      );

      creditsAwarded = rewardResult.creditsAwarded;

      // If abuse was detected, log it but don't fail the vote
      if (rewardResult.abuseDetected) {
        console.warn(`Vote abuse detected for user ${user.id}: ${rewardResult.reason}`);
      }
    }

    return NextResponse.json({ 
      vote: result.vote, 
      creditsAwarded,
      message: creditsAwarded > 0 ? `Awarded ${creditsAwarded} credits to prompt author` : undefined
    });

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
