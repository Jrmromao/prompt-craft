import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VoteRewardService } from '@/lib/services/voteRewardService';
import { prisma } from '@/lib/prisma';
import { VoteAbuseStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { caseId, resolution, status } = body;

    if (!caseId || !resolution || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Object.values(VoteAbuseStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const voteRewardService = VoteRewardService.getInstance();
    const success = await voteRewardService.investigateAbuse(
      caseId,
      user.id,
      resolution,
      status
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update case' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error investigating abuse case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 