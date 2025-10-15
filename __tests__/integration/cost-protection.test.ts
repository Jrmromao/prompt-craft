import { CostTrackingService } from '@/lib/services/costTrackingService';
import { prisma } from '@/lib/prisma';
import { COST_LIMITS } from '@/app/constants/modelCosts';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiUsage: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    user: {
      findMany: jest.fn()
    }
  }
}));

describe.skip('Cost Protection Integration Tests', () => {
  let costService: CostTrackingService;
  const mockUserId = 'user_test_123';

  beforeEach(() => {
    costService = CostTrackingService.getInstance();
    costService.clearCache();
    jest.clearAllMocks();
  });

  describe('Cost Tracking', () => {
    it('should track API cost and store in database', async () => {
      (prisma.apiUsage.create as jest.Mock).mockResolvedValue({});

      await costService.trackApiCost({
        userId: mockUserId,
        model: 'deepseek-chat',
        inputTokens: 1000,
        outputTokens: 1000,
        costUSD: 0.00042,
        credits: 1,
        timestamp: new Date()
      });

      expect(prisma.apiUsage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            inputTokens: 1000,
            outputTokens: 1000
          })
        })
      );
    });

    it('should invalidate cache after tracking', async () => {
      (prisma.apiUsage.create as jest.Mock).mockResolvedValue({});
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      // First call - cache miss
      await costService.getUserMonthlyCost(mockUserId);
      const firstCallCount = (prisma.apiUsage.findMany as jest.Mock).mock.calls.length;

      // Track new cost
      await costService.trackApiCost({
        userId: mockUserId,
        model: 'deepseek-chat',
        inputTokens: 1000,
        outputTokens: 1000,
        costUSD: 0.00042,
        credits: 1,
        timestamp: new Date()
      });

      // Second call - should query DB again (cache invalidated)
      await costService.getUserMonthlyCost(mockUserId);
      const secondCallCount = (prisma.apiUsage.findMany as jest.Mock).mock.calls.length;

      expect(secondCallCount).toBeGreaterThan(firstCallCount);
    });
  });

  describe('Monthly Cost Summary', () => {
    it('should calculate monthly costs correctly', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([
        { inputTokens: 1000, outputTokens: 1000, createdAt: new Date() },
        { inputTokens: 2000, outputTokens: 2000, createdAt: new Date() }
      ]);

      const summary = await costService.getUserMonthlyCost(mockUserId, 'FREE');

      expect(summary.totalCostUSD).toBeGreaterThan(0);
      expect(summary.apiCallCount).toBe(2);
      expect(summary.byModel).toHaveProperty('deepseek-chat');
    });

    it('should detect when user is near limit', async () => {
      const nearLimitUsage = Array(100).fill({
        inputTokens: 10000,
        outputTokens: 10000,
        createdAt: new Date()
      });

      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue(nearLimitUsage);

      const summary = await costService.getUserMonthlyCost(mockUserId, 'FREE');

      expect(summary.isNearLimit).toBe(true);
    });

    it('should detect when user is over limit', async () => {
      const overLimitUsage = Array(200).fill({
        inputTokens: 10000,
        outputTokens: 10000,
        createdAt: new Date()
      });

      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue(overLimitUsage);

      const summary = await costService.getUserMonthlyCost(mockUserId, 'FREE');

      expect(summary.isOverLimit).toBe(true);
    });

    it('should cache results for performance', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      // First call
      await costService.getUserMonthlyCost(mockUserId);
      // Second call (should use cache)
      await costService.getUserMonthlyCost(mockUserId);

      // Should only query DB once
      expect(prisma.apiUsage.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cost Affordability Check', () => {
    it('should allow operation within budget', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      const result = await costService.canAffordOperation(
        mockUserId,
        'deepseek-chat',
        1000,
        1000,
        'FREE'
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block operation over budget', async () => {
      // Mock usage that's already at limit
      const highUsage = Array(1000).fill({
        inputTokens: 10000,
        outputTokens: 10000,
        createdAt: new Date()
      });

      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue(highUsage);

      const result = await costService.canAffordOperation(
        mockUserId,
        'gpt-4-turbo',
        1000,
        1000,
        'FREE'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('limit reached');
    });

    it('should provide cost breakdown', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      const result = await costService.canAffordOperation(
        mockUserId,
        'deepseek-chat',
        1000,
        1000,
        'FREE'
      );

      expect(result.currentCost).toBeDefined();
      expect(result.estimatedCost).toBeDefined();
      expect(result.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Hard Cap Enforcement', () => {
    it('should not switch model when under limit', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      const result = await costService.enforceHardCap(
        mockUserId,
        'gpt-4-turbo',
        'PRO'
      );

      expect(result.switched).toBe(false);
      expect(result.model).toBe('gpt-4-turbo');
    });

    it('should switch to cheapest model when over limit', async () => {
      const overLimitUsage = Array(1000).fill({
        inputTokens: 10000,
        outputTokens: 10000,
        createdAt: new Date()
      });

      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue(overLimitUsage);

      const result = await costService.enforceHardCap(
        mockUserId,
        'gpt-4-turbo',
        'FREE'
      );

      expect(result.switched).toBe(true);
      expect(result.model).toBe('deepseek-coder-6.7b');
      expect(result.reason).toContain('limit');
    });

    it('should switch to affordable model when near limit', async () => {
      const nearLimitUsage = Array(80).fill({
        inputTokens: 10000,
        outputTokens: 10000,
        createdAt: new Date()
      });

      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue(nearLimitUsage);

      const result = await costService.enforceHardCap(
        mockUserId,
        'gpt-4-turbo',
        'FREE'
      );

      expect(result.switched).toBe(true);
      expect(result.model).toBe('deepseek-chat');
    });
  });

  describe('Platform Cost Monitoring', () => {
    it('should calculate total platform costs', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user1', inputTokens: 1000, outputTokens: 1000 },
        { userId: 'user2', inputTokens: 2000, outputTokens: 2000 }
      ]);

      const costs = await costService.getPlatformCosts();

      expect(costs.totalCostUSD).toBeGreaterThan(0);
      expect(costs.totalApiCalls).toBe(2);
      expect(costs.averageCostPerCall).toBeGreaterThan(0);
      expect(costs.byUser.length).toBe(2);
    });

    it('should identify users approaching limit', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: 'user1', planType: 'FREE' }
      ]);

      const nearLimitUsage = Array(100).fill({
        inputTokens: 10000,
        outputTokens: 10000,
        createdAt: new Date()
      });

      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue(nearLimitUsage);

      const users = await costService.getUsersApproachingLimit(0.8);

      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty('userId');
      expect(users[0]).toHaveProperty('cost');
      expect(users[0]).toHaveProperty('limit');
    });
  });

  describe('Performance', () => {
    it('should complete cost check in under 100ms', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      const start = Date.now();
      await costService.canAffordOperation(mockUserId, 'deepseek-chat', 1000, 1000, 'FREE');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      const promises = Array(10).fill(null).map(() =>
        costService.getUserMonthlyCost(mockUserId, 'FREE')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveProperty('totalCostUSD');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with no usage', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([]);

      const summary = await costService.getUserMonthlyCost(mockUserId, 'FREE');

      expect(summary.totalCostUSD).toBe(0);
      expect(summary.apiCallCount).toBe(0);
      expect(summary.isOverLimit).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(
        costService.getUserMonthlyCost(mockUserId, 'FREE')
      ).rejects.toThrow();
    });

    it('should respect different plan limits', async () => {
      (prisma.apiUsage.findMany as jest.Mock).mockResolvedValue([
        { inputTokens: 100000, outputTokens: 100000, createdAt: new Date() }
      ]);

      const freeSummary = await costService.getUserMonthlyCost(mockUserId, 'FREE');
      costService.clearCache();
      const proSummary = await costService.getUserMonthlyCost(mockUserId, 'PRO');

      expect(freeSummary.remainingBudget).toBeLessThan(proSummary.remainingBudget);
    });
  });
});
