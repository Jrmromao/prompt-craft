import { LeaderboardService } from '@/lib/services/LeaderboardService';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    voteReward: {
      groupBy: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe.skip('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(() => {
    service = LeaderboardService.getInstance();
    jest.clearAllMocks();
  });

  describe('getTopCreators', () => {
    it('should return top creators with correct ranking', async () => {
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: 'avatar1.jpg',
          _count: { prompts: 5 },
          prompts: [{ upvotes: 10 }, { upvotes: 15 }]
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          imageUrl: 'avatar2.jpg',
          _count: { prompts: 3 },
          prompts: [{ upvotes: 8 }]
        }
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await service.getTopCreators(2);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: '1',
        username: 'John Doe',
        avatar: 'avatar1.jpg',
        score: 25,
        rank: 1,
        badge: '👑'
      });
      expect(result[1]).toEqual({
        userId: '2',
        username: 'Jane Smith',
        avatar: 'avatar2.jpg',
        score: 8,
        rank: 2,
        badge: '🥈'
      });
    });

    it('should handle empty results', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await service.getTopCreators();

      expect(result).toEqual([]);
    });
  });

  describe('getTopVoters', () => {
    it('should return top voters with vote counts', async () => {
      const mockVoters = [
        { voterId: '1', _sum: { creditsAwarded: 50 }, _count: { voterId: 25 } },
        { voterId: '2', _sum: { creditsAwarded: 30 }, _count: { voterId: 15 } }
      ];

      const mockUsers = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', imageUrl: 'alice.jpg' },
        { id: '2', firstName: 'Bob', lastName: 'Wilson', imageUrl: 'bob.jpg' }
      ];

      mockPrisma.voteReward.groupBy.mockResolvedValue(mockVoters as any);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await service.getTopVoters(2);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: '1',
        username: 'Alice Johnson',
        avatar: 'alice.jpg',
        score: 25,
        rank: 1,
        badge: '🗳️'
      });
    });
  });

  describe('getUserRank', () => {
    it('should return user rank and total', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        prompts: [{ upvotes: 10 }, { upvotes: 5 }]
      } as any);

      mockPrisma.user.count.mockResolvedValue(100);

      const result = await service.getUserRank('user1');

      expect(result).toEqual({
        rank: 101,
        total: 100
      });
    });

    it('should handle user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.count.mockResolvedValue(50);

      const result = await service.getUserRank('nonexistent');

      expect(result).toEqual({
        rank: 51,
        total: 50
      });
    });
  });
});
