import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VoteAbuseMonitoringService } from '@/lib/services/voteAbuseMonitoringService';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const monitoringService = VoteAbuseMonitoringService.getInstance();
    const statistics = await monitoringService.getAbuseStatistics(days);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching abuse statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 