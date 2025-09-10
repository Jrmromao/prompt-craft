import { prisma } from '@/lib/prisma';

interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  prize: string;
  participants: number;
  status: 'upcoming' | 'active' | 'ended';
}

export class ChallengeService {
  private static instance: ChallengeService;

  static getInstance(): ChallengeService {
    if (!ChallengeService.instance) {
      ChallengeService.instance = new ChallengeService();
    }
    return ChallengeService.instance;
  }

  async getActiveChallenges(): Promise<any[]> {
    const now = new Date();
    
    const challenges = await prisma.challenge.findMany({
      where: {
        endDate: { gte: now }
      },
      include: {
        _count: {
          select: { participations: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    return challenges.map(c => ({
      id: c.id,
      title: c.name,
      description: c.description,
      theme: c.category,
      startDate: c.startDate,
      endDate: c.endDate,
      prize: JSON.stringify(c.rewards),
      participants: c._count.participations,
      status: now < c.startDate ? 'upcoming' : 
              now > c.endDate ? 'ended' : 'active'
    }));
  }

  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      await prisma.challengeParticipation.create({
        data: { 
          userId, 
          challengeId,
          progress: { started: true, completed: false }
        }
      });
      return true;
    } catch {
      return false; // Already joined
    }
  }

  async getChallengeLeaderboard(challengeId: string) {
    // Get participants of the challenge
    const participants = await prisma.challengeParticipation.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            imageUrl: true,
            prompts: {
              where: { isPublic: true },
              orderBy: { upvotes: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    return participants
      .map(p => ({
        ...p.user,
        topPrompt: p.user.prompts[0],
        upvotes: p.user.prompts[0]?.upvotes || 0
      }))
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 10);
  }

  async createWeeklyChallenge() {
    const themes = [
      'Creative Writing Assistant',
      'Code Review Expert',
      'Marketing Genius',
      'Educational Tutor',
      'Problem Solver'
    ];
    
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return await prisma.challenge.create({
      data: {
        name: `Weekly Challenge: ${theme}`,
        description: `Create the best ${theme.toLowerCase()} prompt this week!`,
        icon: '🏆',
        category: 'WEEKLY',
        type: 'INDIVIDUAL',
        difficulty: 'MEDIUM',
        requirements: { theme },
        rewards: { credits: 100, badge: 'Featured' },
        startDate,
        endDate,
        isPremium: false
      }
    });
  }
}
