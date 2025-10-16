import { SavingsCalculator } from '@/lib/services/savingsCalculator';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    promptRun: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/cacheService', () => ({
  CacheService: {
    getStats: jest.fn(),
  },
}));

describe('SavingsCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateBaselineCost', () => {
    it('should calculate GPT-4 baseline cost correctly', () => {
      const cost = SavingsCalculator.calculateBaselineCost('gpt-4', 'gpt-3.5-turbo', 1000);
      expect(cost).toBe(0.045); // 1000 tokens * $0.045 per 1k
    });

    it('should calculate Claude Opus baseline cost correctly', () => {
      const cost = SavingsCalculator.calculateBaselineCost(
        'claude-3-opus',
        'claude-3-haiku',
        1000
      );
      expect(cost).toBe(0.045);
    });

    it('should handle unknown models with default rate', () => {
      const cost = SavingsCalculator.calculateBaselineCost('unknown-model', 'gpt-3.5-turbo', 1000);
      expect(cost).toBe(0.01); // Default rate
    });
  });

  describe('getSavings', () => {
    it('should calculate total savings from smart routing', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
          inputTokens: 500,
          outputTokens: 500,
        },
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
          inputTokens: 500,
          outputTokens: 500,
        },
      ]);

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({
        hits: 10,
        misses: 2,
        hitRate: 83.3,
        savedCost: 0.5,
      });

      const startDate = new Date('2024-10-01');
      const endDate = new Date('2024-10-31');

      const savings = await SavingsCalculator.getSavings('user-123', startDate, endDate);

      expect(savings.smartRouting).toBe(0.09); // 0.044 * 2 = 0.088, rounded to 0.09
      expect(savings.caching).toBe(0.5);
      expect(savings.totalSaved).toBeGreaterThan(0);
    });

    it('should calculate baseline cost correctly', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
        },
      ]);

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({
        savedCost: 0,
      });

      const startDate = new Date('2024-10-01');
      const endDate = new Date('2024-10-31');

      const savings = await SavingsCalculator.getSavings('user-123', startDate, endDate);

      expect(savings.baselineCost).toBe(0.05); // 1000 tokens * $0.045 + actual cost
      expect(savings.actualCost).toBe(0.001);
    });

    it('should calculate savings rate', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
        },
      ]);

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({ savedCost: 0 });

      const startDate = new Date('2024-10-01');
      const endDate = new Date('2024-10-31');

      const savings = await SavingsCalculator.getSavings('user-123', startDate, endDate);

      expect(savings.savingsRate).toBeGreaterThan(0);
      expect(savings.savingsRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getTodaySavings', () => {
    it('should return today\'s savings', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
        },
      ]);

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({ savedCost: 0.1 });

      const todaySavings = await SavingsCalculator.getTodaySavings('user-123');

      expect(todaySavings).toBeGreaterThan(0);
    });
  });

  describe('calculateROI', () => {
    it('should calculate positive ROI', () => {
      const roi = SavingsCalculator.calculateROI(100, 9);
      expect(roi).toBe(1011); // (100 - 9) / 9 * 100 = 1011%
    });

    it('should handle zero subscription cost', () => {
      const roi = SavingsCalculator.calculateROI(100, 0);
      expect(roi).toBe(0);
    });

    it('should handle negative ROI', () => {
      const roi = SavingsCalculator.calculateROI(5, 9);
      expect(roi).toBe(-44); // (5 - 9) / 9 * 100 = -44%
    });
  });

  describe('getSummary', () => {
    it('should return complete savings summary', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
        },
      ]);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        planType: 'PRO',
      });

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({ savedCost: 0.5 });

      const summary = await SavingsCalculator.getSummary('user-123');

      expect(summary).toHaveProperty('today');
      expect(summary).toHaveProperty('month');
      expect(summary).toHaveProperty('breakdown');
      expect(summary).toHaveProperty('roi');
      expect(summary.subscriptionCost).toBe(9);
    });

    it('should handle free plan users', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        planType: 'FREE',
      });

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({ savedCost: 0 });

      const summary = await SavingsCalculator.getSummary('user-123');

      expect(summary.subscriptionCost).toBe(0);
    });
  });

  describe('getDailySavings', () => {
    it('should return daily savings for specified period', async () => {
      (prisma.promptRun.findMany as jest.Mock).mockResolvedValue([
        {
          model: 'gpt-3.5-turbo',
          requestedModel: 'gpt-4',
          tokensUsed: 1000,
          cost: 0.001,
          savings: 0.044,
        },
      ]);

      const { CacheService } = require('@/lib/services/cacheService');
      CacheService.getStats.mockResolvedValue({ savedCost: 0.1 });

      const dailySavings = await SavingsCalculator.getDailySavings('user-123', 7);

      expect(dailySavings).toHaveLength(7);
      expect(dailySavings[0]).toHaveProperty('date');
      expect(dailySavings[0]).toHaveProperty('saved');
      expect(dailySavings[0]).toHaveProperty('baseline');
      expect(dailySavings[0]).toHaveProperty('actual');
    });
  });
});
