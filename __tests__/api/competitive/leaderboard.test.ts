import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/competitive/leaderboard/route';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    voteReward: {
      groupBy: jest.fn(),
    },
    userAchievement: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    challenge: {
      findMany: jest.fn(),
    },
    prompt: {
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    vote: {
      count: jest.fn(),
    },
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe.skip('/api/competitive/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return competitive data for authenticated user', async () => {
      // Mock authentication
      mockAuth.mockResolvedValue({ userId: 'clerk_user_1' });

      // Mock user lookup
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'db_user_1',
        clerkId: 'clerk_user_1'
      } as any);

      // Mock leaderboard data
      const mockTopCreators = [
        {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: 'avatar1.jpg',
          _count: { prompts: 5 },
          prompts: [{ upvotes: 25 }]
        }
      ];

      const mockTopVoters = [
        { voterId: 'user2', _sum: { creditsAwarded: 100 }, _count: { voterId: 50 } }
      ];

      const mockVoterUsers = [
        { id: 'user2', firstName: 'Jane', lastName: 'Smith', imageUrl: 'avatar2.jpg' }
      ];

      mockPrisma.user.findMany
        .mockResolvedValueOnce(mockTopCreators as any) // For top creators
        .mockResolvedValueOnce(mockVoterUsers as any); // For voter details

      mockPrisma.voteReward.groupBy.mockResolvedValue(mockTopVoters as any);
      mockPrisma.user.count.mockResolvedValue(100);

      // Mock achievements
      mockPrisma.userAchievement.findMany.mockResolvedValue([]);
      mockPrisma.prompt.count.mockResolvedValue(0);
      mockPrisma.prompt.findFirst.mockResolvedValue(null);
      mockPrisma.vote.count.mockResolvedValue(0);

      // Mock challenges
      mockPrisma.challenge.findMany.mockResolvedValue([
        {
          id: 'challenge1',
          title: 'Weekly Challenge',
          description: 'Create amazing prompts',
          theme: 'Creative Writing',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          prize: '100 credits',
          _count: { participants: 25 }
        }
      ] as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('topCreators');
      expect(data).toHaveProperty('topVoters');
      expect(data).toHaveProperty('userRank');
      expect(data).toHaveProperty('achievements');
      expect(data).toHaveProperty('activeChallenges');
      expect(data).toHaveProperty('newAchievements');

      expect(data.topCreators).toHaveLength(1);
      expect(data.topCreators[0]).toEqual({
        userId: 'user1',
        username: 'John Doe',
        avatar: 'avatar1.jpg',
        score: 25,
        rank: 1,
        badge: '👑'
      });

      expect(data.activeChallenges).toHaveLength(1);
      expect(data.activeChallenges[0]).toMatchObject({
        id: 'challenge1',
        title: 'Weekly Challenge',
        participants: 25,
        status: 'active'
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for user not found in database', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk_user_1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should handle service errors gracefully', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk_user_1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'db_user_1' } as any);
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
