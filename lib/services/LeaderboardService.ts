import { prisma } from '@/lib/prisma';

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  badge?: string;
  streak?: number;
}

export class LeaderboardService {
  private static instance: LeaderboardService;

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  async getTopCreators(limit = 10): Promise<LeaderboardEntry[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true,
        _count: {
          select: {
            prompts: { where: { isPublic: true } }
          }
        },
        prompts: {
          select: { upvotes: true },
          where: { isPublic: true }
        }
      },
      orderBy: {
        prompts: { _count: 'desc' }
      },
      take: limit
    });

    return users.map((user, index) => ({
      userId: user.id,
      username: user.displayName || user.name || 'Unknown User',
      avatar: user.imageUrl || undefined,
      score: user.prompts.reduce((sum, p) => sum + p.upvotes, 0),
      rank: index + 1,
      badge: index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : undefined
    }));
  }

  async getTopVoters(limit = 10): Promise<LeaderboardEntry[]> {
    const voters = await prisma.voteReward.groupBy({
      by: ['voterId'],
      _sum: { creditsAwarded: true },
      _count: { voterId: true },
      orderBy: { _count: { voterId: 'desc' } },
      take: limit
    });

    const userIds = voters.map(v => v.voterId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, displayName: true, imageUrl: true }
    });

    return voters.map((voter, index) => {
      const user = users.find(u => u.id === voter.voterId);
      return {
        userId: voter.voterId,
        username: user ? (user.displayName || user.name || 'Unknown') : 'Unknown',
        avatar: user?.imageUrl || undefined,
        score: voter._count.voterId,
        rank: index + 1,
        badge: index === 0 ? '🗳️' : undefined
      };
    });
  }

  async getUserRank(userId: string): Promise<{ rank: number; total: number }> {
    const userScore = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        prompts: {
          select: { upvotes: true },
          where: { isPublic: true }
        }
      }
    });

    const totalScore = userScore?.prompts.reduce((sum, p) => sum + p.upvotes, 0) || 0;

    const higherRanked = await prisma.user.count({
      where: {
        prompts: {
          some: {
            isPublic: true
          }
        }
      }
    });

    return { rank: higherRanked + 1, total: higherRanked };
  }
}
