import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LeaderboardService } from '@/lib/services/LeaderboardService';
import { AchievementService } from '@/lib/services/AchievementService';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const leaderboardService = LeaderboardService.getInstance();
    const achievementService = AchievementService.getInstance();
    const challengeService = ChallengeService.getInstance();

    const [
      topCreators,
      topVoters,
      userRank,
      achievements,
      activeChallenges
    ] = await Promise.all([
      leaderboardService.getTopCreators(10),
      leaderboardService.getTopVoters(10),
      leaderboardService.getUserRank(user.id),
      achievementService.getUserAchievements(user.id),
      challengeService.getActiveChallenges()
    ]);

    // Check for new achievements
    const newAchievements = await achievementService.checkAchievements(user.id);

    return NextResponse.json({
      topCreators,
      topVoters,
      userRank,
      achievements,
      activeChallenges,
      newAchievements
    });
  } catch (error) {
    console.error('Error fetching competitive data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
