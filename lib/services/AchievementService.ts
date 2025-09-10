import { prisma } from '@/lib/prisma';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  condition: (userId: string) => Promise<boolean>;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_prompt',
    title: 'First Steps',
    description: 'Create your first prompt',
    icon: '🌱',
    rarity: 'common',
    points: 10,
    condition: async (userId) => {
      const count = await prisma.prompt.count({ where: { userId } });
      return count >= 1;
    }
  },
  {
    id: 'viral_prompt',
    title: 'Viral Creator',
    description: 'Get 100+ upvotes on a single prompt',
    icon: '🚀',
    rarity: 'epic',
    points: 100,
    condition: async (userId) => {
      const prompt = await prisma.prompt.findFirst({
        where: { userId, upvotes: { gte: 100 } }
      });
      return !!prompt;
    }
  },
  {
    id: 'community_champion',
    title: 'Community Champion',
    description: 'Give 500+ upvotes to others',
    icon: '🏆',
    rarity: 'legendary',
    points: 250,
    condition: async (userId) => {
      const count = await prisma.vote.count({
        where: { userId, value: 1 }
      });
      return count >= 500;
    }
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Create prompts for 7 consecutive days',
    icon: '🔥',
    rarity: 'rare',
    points: 50,
    condition: async (userId) => {
      // Simplified - would need more complex date logic
      const recentPrompts = await prisma.prompt.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      });
      return recentPrompts >= 7;
    }
  }
];

export class AchievementService {
  private static instance: AchievementService;

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  async checkAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const hasAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id
          }
        }
      });

      if (!hasAchievement && await achievement.condition(userId)) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date()
          }
        });
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  async getUserAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId }
    });

    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      earned: userAchievements.some(ua => ua.achievementId === achievement.id),
      earnedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt
    }));
  }
}
