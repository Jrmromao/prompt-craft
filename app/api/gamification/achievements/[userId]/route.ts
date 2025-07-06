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

    // Mock achievements data for now until database is migrated
    const achievements = [
      {
        id: 'first-prompt',
        name: 'First Steps',
        description: 'Create your first prompt',
        icon: '🚀',
        category: 'CREATOR',
        tier: 'BRONZE',
        unlocked: false,
        rewards: { credits: 10, experience: 50, badges: ['newcomer'] },
        isSecret: false,
        isPremium: false,
      },
      {
        id: 'prompt-creator-5',
        name: 'Getting Started',
        description: 'Create 5 prompts',
        icon: '✨',
        category: 'CREATOR',
        tier: 'BRONZE',
        unlocked: false,
        rewards: { credits: 25, experience: 100, badges: ['creator'] },
        isSecret: false,
        isPremium: false,
      },
      {
        id: 'active-voter',
        name: 'Community Supporter',
        description: 'Cast 10 votes',
        icon: '👍',
        category: 'VOTER',
        tier: 'BRONZE',
        unlocked: true,
        unlockedAt: new Date(),
        rewards: { credits: 15, experience: 75, badges: ['supporter'] },
        isSecret: false,
        isPremium: false,
      },
    ];

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 