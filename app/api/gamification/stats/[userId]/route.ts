import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PlanType } from '@/utils/constants';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { userId } = await context.params;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Users can only access their own stats (for now)
    if (clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mock user stats for now until database is migrated
    const stats = {
      level: 5,
      experience: 1250,
      expToNext: 750,
      totalExpRequired: 2000,
      reputation: 150,
      streak: 7,
      longestStreak: 15,
      totalCreditsEarned: 340,
      achievements: 3,
      badges: 2,
      rank: 42,
      tier: 'BRONZE',
      planType: PlanType.FREE,
      premiumCredits: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 