import { AchievementService } from '@/lib/services/AchievementService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    vote: {
      count: jest.fn(),
    },
    userAchievement: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe.skip('AchievementService', () => {
  let service: AchievementService;

  beforeEach(() => {
    service = AchievementService.getInstance();
    jest.clearAllMocks();
  });

  describe('checkAchievements', () => {
    it('should award first_prompt achievement', async () => {
      const userId = 'user1';
      
      // Mock: user has 1 prompt
      mockPrisma.prompt.count.mockResolvedValue(1);
      
      // Mock: user doesn't have achievement yet
      mockPrisma.userAchievement.findUnique.mockResolvedValue(null);
      
      // Mock: other conditions return false
      mockPrisma.prompt.findFirst.mockResolvedValue(null);
      mockPrisma.vote.count.mockResolvedValue(0);

      const result = await service.checkAchievements(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('first_prompt');
      expect(result[0].title).toBe('First Steps');
      expect(mockPrisma.userAchievement.create).toHaveBeenCalledWith({
        data: {
          userId,
          achievementId: 'first_prompt',
          earnedAt: expect.any(Date)
        }
      });
    });

    it('should award viral_prompt achievement', async () => {
      const userId = 'user1';
      
      mockPrisma.prompt.count.mockResolvedValue(0); // No first prompt
      mockPrisma.prompt.findFirst.mockResolvedValue({ id: 'prompt1' } as any); // Has viral prompt
      mockPrisma.vote.count.mockResolvedValue(0);
      
      mockPrisma.userAchievement.findUnique.mockResolvedValue(null);

      const result = await service.checkAchievements(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('viral_prompt');
      expect(result[0].rarity).toBe('epic');
      expect(result[0].points).toBe(100);
    });

    it('should not award existing achievements', async () => {
      const userId = 'user1';
      
      mockPrisma.prompt.count.mockResolvedValue(1);
      mockPrisma.userAchievement.findUnique.mockResolvedValue({
        id: 'existing',
        userId,
        achievementId: 'first_prompt',
        earnedAt: new Date()
      } as any);

      const result = await service.checkAchievements(userId);

      expect(result).toHaveLength(0);
      expect(mockPrisma.userAchievement.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserAchievements', () => {
    it('should return user achievements with earned status', async () => {
      const userId = 'user1';
      const earnedDate = new Date();
      
      mockPrisma.userAchievement.findMany.mockResolvedValue([
        {
          id: '1',
          userId,
          achievementId: 'first_prompt',
          earnedAt: earnedDate
        }
      ] as any);

      const result = await service.getUserAchievements(userId);

      expect(result).toHaveLength(4); // Total achievements defined
      
      const firstPrompt = result.find(a => a.id === 'first_prompt');
      expect(firstPrompt?.earned).toBe(true);
      expect(firstPrompt?.earnedAt).toEqual(earnedDate);
      
      const viral = result.find(a => a.id === 'viral_prompt');
      expect(viral?.earned).toBe(false);
      expect(viral?.earnedAt).toBeUndefined();
    });

    it('should handle user with no achievements', async () => {
      mockPrisma.userAchievement.findMany.mockResolvedValue([]);

      const result = await service.getUserAchievements('user1');

      expect(result).toHaveLength(4);
      expect(result.every(a => !a.earned)).toBe(true);
    });
  });
});
