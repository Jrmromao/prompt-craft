import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommunityService } from '@/lib/services/communityService';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const promptId = params.id;

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
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
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

    return NextResponse.json({ vote });
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
