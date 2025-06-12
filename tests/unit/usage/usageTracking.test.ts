import { UsageTrackingService } from '@/lib/services/usage/usageTrackingService';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    usage: {
      create: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

describe('UsageTrackingService', () => {
  const service = UsageTrackingService.getInstance();
  const mockUserId = 'user123';
  const mockFeature = 'prompts';
  const mockCount = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackUsage', () => {
    it('should track usage successfully', async () => {
      // Mock user with subscription
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        subscription: {
          id: 'sub123',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          plan: {
            id: 'plan123',
            features: JSON.stringify({
              maxPrompts: 100,
              maxTokens: 1000,
              maxTeamMembers: 1,
            }),
          },
        },
      });

      // Mock usage aggregation
      (prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: 0 },
      });

      // Mock usage creation
      (prisma.usage.create as jest.Mock).mockResolvedValue({
        id: 'usage123',
        userId: mockUserId,
        feature: mockFeature,
        count: mockCount,
        timestamp: new Date(),
      });

      const result = await service.trackUsage(mockUserId, mockFeature, mockCount);

      expect(result).toEqual({
        id: 'usage123',
        userId: mockUserId,
        feature: mockFeature,
        count: mockCount,
        timestamp: expect.any(Date),
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      expect(prisma.usage.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          feature: mockFeature,
          count: mockCount,
        },
      });
    });

    it('should throw error when no subscription is found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.trackUsage(mockUserId, mockFeature)).rejects.toThrow(
        'No active subscription found'
      );
    });

    it('should throw error when usage limit is exceeded', async () => {
      // Mock user with subscription
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        subscription: {
          id: 'sub123',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          plan: {
            id: 'plan123',
            features: JSON.stringify({
              maxPrompts: 5,
              maxTokens: 1000,
              maxTeamMembers: 1,
            }),
          },
        },
      });

      // Mock usage aggregation to return current usage
      (prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { count: 5 },
      });

      await expect(service.trackUsage(mockUserId, mockFeature)).rejects.toThrow(
        'Usage limit exceeded for feature: prompts'
      );
    });
  });

  describe('getUsageMetrics', () => {
    it('should return usage metrics for all features', async () => {
      // Mock usage aggregation for each feature
      (prisma.usage.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { count: 10 } }) // prompts
        .mockResolvedValueOnce({ _sum: { count: 1000 } }) // tokens
        .mockResolvedValueOnce({ _sum: { count: 2 } }); // team_members

      const result = await service.getUsageMetrics(mockUserId);

      expect(result).toEqual({
        prompts: 10,
        tokens: 1000,
        team_members: 2,
      });

      expect(prisma.usage.aggregate).toHaveBeenCalledTimes(3);
    });
  });
}); 