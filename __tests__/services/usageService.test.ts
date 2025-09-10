import { UsageService } from '@/lib/services/usageService';
import { prisma } from '@/lib/prisma';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    usage: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('UsageService', () => {
  let usageService: UsageService;

  beforeEach(() => {
    jest.clearAllMocks();
    usageService = UsageService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = UsageService.getInstance();
    const instance2 = UsageService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should get user usage successfully', async () => {
    const mockUser = {
      id: 'user123',
      creditCap: 1000,
      subscription: {
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-01-31'),
      },
    };

    const mockUsage = [
      {
        timestamp: new Date('2024-01-15'),
        feature: 'playground',
        count: 10,
      },
      {
        timestamp: new Date('2024-01-20'),
        feature: 'ai_generation',
        count: 5,
      },
    ];

    const mockDailyUsage = [
      {
        timestamp: new Date('2024-01-15'),
        _sum: { count: 10 },
      },
      {
        timestamp: new Date('2024-01-20'),
        _sum: { count: 5 },
      },
    ];

    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
    mockPrisma.usage.findMany.mockResolvedValue(mockUsage as any);
    mockPrisma.usage.groupBy.mockResolvedValue(mockDailyUsage as any);

    const result = await usageService.getUserUsage('user123');

    expect(result).toEqual({
      totalCreditsUsed: 15,
      creditsRemaining: 985,
      creditCap: 1000,
      lastCreditReset: '2024-01-01T00:00:00.000Z',
      totalRequests: 2,
      dailyUsage: [
        {
          date: '2024-01-15T00:00:00.000Z',
          used: 10,
        },
        {
          date: '2024-01-20T00:00:00.000Z',
          used: 5,
        },
      ],
      recentActivity: [
        {
          date: '2024-01-15T00:00:00.000Z',
          description: 'Used playground',
          amount: 10,
          type: 'playground',
        },
        {
          date: '2024-01-20T00:00:00.000Z',
          description: 'Used ai_generation',
          amount: 5,
          type: 'ai_generation',
        },
      ],
    });
  });

  it('should throw error when no subscription found', async () => {
    const mockUser = {
      id: 'user123',
      creditCap: 1000,
      subscription: null,
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    await expect(usageService.getUserUsage('user123')).rejects.toThrow(
      'No active subscription found'
    );
  });

  it('should handle empty usage data', async () => {
    const mockUser = {
      id: 'user123',
      creditCap: 1000,
      subscription: {
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-01-31'),
      },
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
    mockPrisma.usage.findMany.mockResolvedValue([]);
    mockPrisma.usage.groupBy.mockResolvedValue([]);

    const result = await usageService.getUserUsage('user123');

    expect(result).toEqual({
      totalCreditsUsed: 0,
      creditsRemaining: 1000,
      creditCap: 1000,
      lastCreditReset: '2024-01-01T00:00:00.000Z',
      totalRequests: 0,
      dailyUsage: [],
      recentActivity: [],
    });
  });

  it('should handle database errors', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    await expect(usageService.getUserUsage('user123')).rejects.toThrow(
      'Database error'
    );
  });
});
