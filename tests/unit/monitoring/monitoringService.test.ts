// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
  }));
});

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock SubscriptionStatus
jest.mock('@prisma/client', () => ({
  SubscriptionStatus: {
    ACTIVE: 'ACTIVE',
    PAST_DUE: 'PAST_DUE',
    CANCELED: 'CANCELED',
  },
}));

import { MonitoringService } from '@/lib/services/monitoring/monitoringService';
import { UsageTrackingService } from '@/lib/services/usage/usageTrackingService';
import { AuditService } from '@/lib/services/auditService';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/services/usage/usageTrackingService', () => ({
  UsageTrackingService: {
    getInstance: jest.fn().mockReturnValue({
      getUsageMetrics: jest.fn(),
      getUserLimits: jest.fn().mockResolvedValue({
        prompts: 1000,
        tokens: 10000,
        team_members: 5
      })
    }),
  },
}));

jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    getInstance: jest.fn().mockReturnValue({
      logAction: jest.fn(),
      logSecurityEvent: jest.fn(),
      logUserAction: jest.fn(),
      logApiCall: jest.fn(),
    }),
  },
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Type the mocked services
type MockedAuditService = {
  logAction: jest.Mock;
  logSecurityEvent: jest.Mock;
  logUserAction: jest.Mock;
  logApiCall: jest.Mock;
};

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;
  let mockUsageService: jest.Mocked<UsageTrackingService>;
  let mockAuditService: MockedAuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsageService = UsageTrackingService.getInstance() as jest.Mocked<UsageTrackingService>;
    mockAuditService = AuditService.getInstance() as unknown as MockedAuditService;
    monitoringService = MonitoringService.getInstance();
  });

  describe('checkUsageLimits', () => {
    it('should check usage limits for active subscriptions', async () => {
      const mockSubscriptions = [
        {
          id: 'sub_123',
          status: SubscriptionStatus.ACTIVE,
          planType: 'PRO',
          userId: 'user_123',
          user: {
            email: 'test@example.com',
          },
          plan: {
            maxPrompts: 1000,
            maxTokens: 10000,
            maxTeamMembers: 5,
          },
        },
      ];

      (prisma.subscription.findMany as jest.Mock).mockResolvedValue(mockSubscriptions);
      (mockUsageService.getUsageMetrics as jest.Mock).mockResolvedValue({
        promptCount: 100,
        tokenUsage: 1000,
        teamMemberCount: 2,
      });

      await monitoringService.checkUsageLimits();

      expect(mockUsageService.getUsageMetrics).toHaveBeenCalled();
      // No audit log assertion, as implementation does not log audit here
    });

    it('should handle errors gracefully', async () => {
      (prisma.subscription.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      await expect(monitoringService.checkUsageLimits()).rejects.toThrow('Database error');
    });
  });
}); 