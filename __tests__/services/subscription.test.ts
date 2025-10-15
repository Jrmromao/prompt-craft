import { SubscriptionService } from '@/lib/services/subscriptionService';
import { PLANS } from '@/lib/plans';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    subscriptions: {
      cancel: jest.fn().mockResolvedValue({}),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    promptRun: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    service = SubscriptionService.getInstance();
    jest.clearAllMocks();
  });

  describe('getUsage', () => {
    it('should calculate usage correctly', async () => {
      const { prisma } = require('@/lib/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        planType: 'STARTER',
      });

      prisma.promptRun.count.mockResolvedValue(5000);
      prisma.promptRun.findMany.mockResolvedValue([
        { promptId: 'p1' },
        { promptId: 'p2' },
        { promptId: 'p3' },
      ]);

      const usage = await service.getUsage('user1');

      expect(usage.trackedRuns.used).toBe(5000);
      expect(usage.trackedRuns.limit).toBe(PLANS.STARTER.limits.trackedRuns);
      expect(usage.trackedRuns.percentage).toBe(50);

      expect(usage.promptsTracked.used).toBe(3);
      expect(usage.promptsTracked.limit).toBe(PLANS.STARTER.limits.promptsTracked);
    });

    it('should handle unlimited plans', async () => {
      const { prisma } = require('@/lib/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        planType: 'ENTERPRISE',
      });

      prisma.promptRun.count.mockResolvedValue(1000000);
      prisma.promptRun.findMany.mockResolvedValue([]);

      const usage = await service.getUsage('user1');

      expect(usage.trackedRuns.percentage).toBe(0); // unlimited
      expect(usage.trackedRuns.limit).toBe(-1);
    });
  });

  describe('checkLimit', () => {
    it('should allow usage under limit', async () => {
      const { prisma } = require('@/lib/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        planType: 'STARTER',
      });

      prisma.promptRun.count.mockResolvedValue(5000);
      prisma.promptRun.findMany.mockResolvedValue([]);

      const allowed = await service.checkLimit('user1', 'trackedRuns');
      expect(allowed).toBe(true);
    });

    it('should block usage over limit', async () => {
      const { prisma } = require('@/lib/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        planType: 'STARTER',
      });

      prisma.promptRun.count.mockResolvedValue(10000);
      prisma.promptRun.findMany.mockResolvedValue([]);

      const allowed = await service.checkLimit('user1', 'trackedRuns');
      expect(allowed).toBe(false);
    });

    it('should always allow unlimited plans', async () => {
      const { prisma } = require('@/lib/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        planType: 'ENTERPRISE',
      });

      prisma.promptRun.count.mockResolvedValue(999999999);
      prisma.promptRun.findMany.mockResolvedValue([]);

      const allowed = await service.checkLimit('user1', 'trackedRuns');
      expect(allowed).toBe(true);
    });
  });
});
