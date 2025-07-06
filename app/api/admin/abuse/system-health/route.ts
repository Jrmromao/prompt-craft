import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VoteAbuseMonitoringService } from '@/lib/services/voteAbuseMonitoringService';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    const monitoringService = VoteAbuseMonitoringService.getInstance();
    const systemHealth = await monitoringService.getSystemHealth();

    return NextResponse.json(systemHealth);
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 