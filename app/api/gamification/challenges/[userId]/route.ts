import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

    // Mock challenges data for now until database is migrated
    const challenges = [
      {
        id: 'daily-creator',
        name: 'Daily Creator',
        description: 'Create a prompt every day this week',
        icon: '📝',
        category: 'DAILY',
        type: 'INDIVIDUAL',
        difficulty: 'EASY',
        progress: 3,
        maxProgress: 7,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        rewards: { credits: 100, experience: 200, badges: ['daily-creator'] },
        isPremium: false,
      },
      {
        id: 'weekly-voter',
        name: 'Weekly Voter',
        description: 'Cast 50 votes this week',
        icon: '🗳️',
        category: 'WEEKLY',
        type: 'INDIVIDUAL',
        difficulty: 'MEDIUM',
        progress: 23,
        maxProgress: 50,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        rewards: { credits: 75, experience: 150, badges: ['weekly-voter'] },
        isPremium: false,
      },
      {
        id: 'premium-challenge',
        name: 'Premium Creator Challenge',
        description: 'Use advanced features to create 10 premium prompts',
        icon: '💎',
        category: 'PREMIUM',
        type: 'INDIVIDUAL',
        difficulty: 'EXPERT',
        progress: 0,
        maxProgress: 10,
        status: 'LOCKED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rewards: { credits: 750, experience: 1500, badges: ['premium-creator'] },
        isPremium: true,
      },
    ];

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 