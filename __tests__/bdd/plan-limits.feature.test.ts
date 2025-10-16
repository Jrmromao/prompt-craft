import { PLAN_LIMITS, checkAISpendLimit, checkPlanLimit } from '@/lib/middleware/planLimits';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    promptRun: {
      aggregate: jest.fn(),
    },
    teamMember: {
      count: jest.fn(),
    },
  },
}));

describe('Feature: Plan Limits Enforcement', () => {
  describe('Scenario: Free user hits AI spend limit', () => {
    it('Given a free user with $100 monthly spend', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        planType: 'FREE',
      });

      (prisma.promptRun.aggregate as jest.Mock).mockResolvedValue({
        _sum: { cost: 100 },
      });

      const result = await checkAISpendLimit('user1');

      expect(result.allowed).toBe(false);
      expect(result.currentSpend).toBe(100);
      expect(result.limit).toBe(100);
    });

    it('Then tracking should be blocked', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        planType: 'FREE',
      });

      (prisma.promptRun.aggregate as jest.Mock).mockResolvedValue({
        _sum: { cost: 100 },
      });

      const result = await checkAISpendLimit('user1');

      expect(result.reason).toContain('reached your FREE plan limit');
    });
  });

  describe('Scenario: Free user tries to use caching', () => {
    it('Given a free user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        planType: 'FREE',
      });

      const result = await checkPlanLimit('user1', 'caching');

      expect(result.allowed).toBe(false);
    });

    it('Then caching should be disabled', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        planType: 'FREE',
      });

      const result = await checkPlanLimit('user1', 'caching');

      expect(result.reason).toContain('not available on your FREE plan');
      expect(result.upgradeUrl).toBe('/pricing');
    });
  });

  describe('Scenario: Pro user uses prompt optimization', () => {
    it('Given a pro user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        planType: 'PRO',
      });

      const result = await checkPlanLimit('user1', 'promptOptimization');

      expect(result.allowed).toBe(true);
    });

    it('Then feature should be enabled', async () => {
      const limits = PLAN_LIMITS.PRO;
      expect(limits.features.promptOptimization).toBe(true);
    });
  });

  describe('Scenario: User at 80% of limit gets warning', () => {
    it('Given a user at 80% spend', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        planType: 'FREE',
      });

      (prisma.promptRun.aggregate as jest.Mock).mockResolvedValue({
        _sum: { cost: 80 },
      });

      const result = await checkAISpendLimit('user1');

      expect(result.percentUsed).toBe(80);
      expect(result.allowed).toBe(true);
    });
  });
});
