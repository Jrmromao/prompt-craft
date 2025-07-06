// Mock all dependencies before imports
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  prompt: {
    findUnique: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  vote: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  },
  voteReward: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  voteAbuseDetection: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  },
  votePattern: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  creditTransaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock services
const mockEmailService = {
  sendEmail: jest.fn(),
};

const mockCreditService = {
  addCredits: jest.fn(),
  getUserCredits: jest.fn(),
};

const mockAuditService = {
  logAudit: jest.fn(),
};

jest.mock('@/lib/services/emailService', () => ({
  EmailService: {
    getInstance: () => mockEmailService,
  },
}));

jest.mock('@/lib/services/creditService', () => ({
  CreditService: {
    getInstance: () => mockCreditService,
  },
}));

jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    getInstance: () => mockAuditService,
  },
}));

// Define enums locally to avoid import issues
const PlanType = {
  FREE: 'FREE',
  PRO: 'PRO',
  ELITE: 'ELITE',
  ENTERPRISE: 'ENTERPRISE',
} as const;

const VoteAbuseType = {
  SELF_VOTE_ATTEMPT: 'SELF_VOTE_ATTEMPT',
  SUSPICIOUS_ACCOUNT_AGE: 'SUSPICIOUS_ACCOUNT_AGE',
  EXCESSIVE_VOTING_RATE: 'EXCESSIVE_VOTING_RATE',
  IP_CLUSTERING: 'IP_CLUSTERING',
  COORDINATED_VOTING: 'COORDINATED_VOTING',
  RAPID_VOTING_PATTERN: 'RAPID_VOTING_PATTERN',
  TEMPORAL_VOTING_PATTERN: 'TEMPORAL_VOTING_PATTERN',
  VOTE_MANIPULATION: 'VOTE_MANIPULATION',
  DEVICE_FINGERPRINTING: 'DEVICE_FINGERPRINTING',
  SOCKPUPPET_VOTING: 'SOCKPUPPET_VOTING',
} as const;

const VoteAbuseSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

const VoteAbuseStatus = {
  PENDING: 'PENDING',
  UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
  RESOLVED: 'RESOLVED',
  FALSE_POSITIVE: 'FALSE_POSITIVE',
  CONFIRMED: 'CONFIRMED',
} as const;

const CreditType = {
  UPVOTE: 'UPVOTE',
  PURCHASE: 'PURCHASE',
  BONUS: 'BONUS',
  REFUND: 'REFUND',
} as const;

// Import services after mocking
//@ts-ignore
import { VoteRewardService } from '@/lib/services/voteRewardService';
//@ts-ignore
import { VoteAbuseMonitoringService } from '@/lib/services/voteAbuseMonitoringService';

describe('Vote Abuse Scenarios - E2E Tests', () => {
  let voteRewardService: VoteRewardService;
  let monitoringService: VoteAbuseMonitoringService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Initialize services
    voteRewardService = VoteRewardService.getInstance();
    monitoringService = VoteAbuseMonitoringService.getInstance();

    // Default mock implementations
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      planType: PlanType.PRO,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    });

    mockPrisma.prompt.findUnique.mockResolvedValue({
      id: 'prompt-123',
      authorId: 'author-123',
      isPublic: true,
      status: 'APPROVED',
    });

    mockPrisma.vote.count.mockResolvedValue(0);
    mockPrisma.voteReward.findFirst.mockResolvedValue(null);
    mockPrisma.voteAbuseDetection.count.mockResolvedValue(0);
    mockPrisma.creditTransaction.create.mockResolvedValue({});
    mockPrisma.voteReward.create.mockResolvedValue({});
    mockPrisma.voteAbuseDetection.create.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return callback(mockPrisma);
    });

    mockCreditService.addCredits.mockResolvedValue(true);
    mockEmailService.sendEmail.mockResolvedValue(undefined);
    mockAuditService.logAudit.mockResolvedValue(undefined);
  });

  describe('Scenario 1: Legitimate Voting Behavior', () => {
    it('should allow normal voting patterns and award credits', async () => {
      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (legitimate browser)'
      );

      expect(result.success).toBe(true);
      expect(result.creditsAwarded).toBe(1);
      expect(result.abuseDetected).toBe(false);
      expect(mockCreditService.addCredits).toHaveBeenCalledWith(
        'author-123',
        1,
        CreditType.UPVOTE,
        'Vote reward'
      );
    });

    it('should handle Elite user voting with higher credit reward', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        planType: PlanType.ELITE,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      });

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (legitimate browser)'
      );

      expect(result.success).toBe(true);
      expect(result.creditsAwarded).toBe(2);
      expect(result.abuseDetected).toBe(false);
    });
  });

  describe('Scenario 2: Self-Voting Prevention', () => {
    it('should prevent users from voting on their own prompts', async () => {
      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'author-123', // Same as prompt author
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.creditsAwarded).toBe(0);
      expect(result.abuseDetected).toBe(true);
      expect(result.reason).toContain('self-voting');
    });
  });

  describe('Scenario 3: Suspicious Account Age Detection', () => {
    it('should detect voting from new accounts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        planType: PlanType.PRO,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      });

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
      expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          abuseType: VoteAbuseType.SUSPICIOUS_ACCOUNT_AGE,
          severity: VoteAbuseSeverity.MEDIUM,
        }),
      });
    });
  });

  describe('Scenario 4: Rate Limiting Detection', () => {
    it('should detect excessive voting rate per hour', async () => {
      mockPrisma.vote.count.mockResolvedValue(21); // Over the 20/hour limit

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
      expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          abuseType: VoteAbuseType.EXCESSIVE_VOTING_RATE,
          severity: VoteAbuseSeverity.HIGH,
        }),
      });
    });

    it('should detect excessive voting rate per day', async () => {
      mockPrisma.vote.count
        .mockResolvedValueOnce(10) // Hour check passes
        .mockResolvedValueOnce(101); // Day check fails (over 100)

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
    });
  });

  describe('Scenario 5: IP Clustering Detection', () => {
    it('should detect coordinated voting from same IP address', async () => {
      mockPrisma.vote.count.mockResolvedValue(51); // Over the 50/day per IP limit

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
      expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          abuseType: VoteAbuseType.IP_CLUSTERING,
          severity: VoteAbuseSeverity.HIGH,
        }),
      });
    });

    it('should detect multiple users from same IP', async () => {
      mockPrisma.vote.count
        .mockResolvedValueOnce(10) // IP votes check passes
        .mockResolvedValueOnce(6); // IP users check fails (over 5)

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
      expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          abuseType: VoteAbuseType.COORDINATED_VOTING,
        }),
      });
    });
  });

  describe('Scenario 6: Temporal Pattern Detection', () => {
    it('should detect rapid voting patterns', async () => {
      // Mock recent votes to simulate rapid voting
      mockPrisma.vote.findMany.mockResolvedValue([
        { createdAt: new Date(Date.now() - 5000) },
        { createdAt: new Date(Date.now() - 10000) },
        { createdAt: new Date(Date.now() - 15000) },
        { createdAt: new Date(Date.now() - 20000) },
        { createdAt: new Date(Date.now() - 25000) },
      ]);

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
    });
  });

  describe('Scenario 7: Vote Manipulation Detection', () => {
    it('should detect excessive voting on same author prompts', async () => {
      mockPrisma.vote.count.mockResolvedValue(11); // Over the 10 same-author limit

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
      expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          abuseType: VoteAbuseType.VOTE_MANIPULATION,
          severity: VoteAbuseSeverity.HIGH,
        }),
      });
    });
  });

  describe('Scenario 8: Device Fingerprinting', () => {
    it('should detect multiple users with same user agent', async () => {
      mockPrisma.vote.count.mockResolvedValue(6); // Over the 5 users per user agent limit

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (suspicious browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
    });
  });

  describe('Scenario 9: Monitoring and Alerting', () => {
    it('should trigger monitoring alerts for high-severity abuse', async () => {
      mockPrisma.vote.count.mockResolvedValue(21); // Trigger rate limit abuse

      const result = await voteRewardService.processVoteReward(
        'vote-1',
        'voter-123',
        'author-123',
        'prompt-123',
        1,
        '192.168.1.1',
        'Mozilla/5.0 (browser)'
      );

      expect(result.success).toBe(false);
      expect(result.abuseDetected).toBe(true);
      // The monitoring service should be called internally
    });

    it('should generate system health metrics', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(50) // Active cases
        .mockResolvedValueOnce(20) // Pending investigations
        .mockResolvedValueOnce(5) // False positives
        .mockResolvedValueOnce(100) // Total resolved
        .mockResolvedValueOnce(10); // Recent detections

      const health = await monitoringService.getSystemHealth();

      expect(health.activeAbuseCases).toBe(50);
      expect(health.pendingInvestigations).toBe(20);
      expect(health.falsePositiveRate).toBeGreaterThan(0);
    });
  });

  describe('Scenario 10: Investigation Workflow', () => {
    it('should handle complete investigation workflow', async () => {
      const abuseId = 'abuse-123';
      const investigatorId = 'investigator-456';

      mockPrisma.voteAbuseDetection.findMany.mockResolvedValue([
        {
          id: abuseId,
          status: VoteAbuseStatus.PENDING,
          abuseType: VoteAbuseType.EXCESSIVE_VOTING_RATE,
          severity: VoteAbuseSeverity.HIGH,
        },
      ]);

      const result = await monitoringService.investigateAbuse(abuseId, investigatorId, {
        action: 'RESOLVE',
        notes: 'Confirmed abuse - user suspended',
        evidence: ['Rate limit exceeded', 'Suspicious IP pattern'],
      });

      expect(result.success).toBe(true);
      expect(mockAuditService.logAudit).toHaveBeenCalled();
    });
  });

  describe('Scenario 11: System Statistics and Reporting', () => {
    it('should generate comprehensive abuse statistics', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(15) // Total detections
        .mockResolvedValueOnce(50) // Last 7 days
        .mockResolvedValueOnce(100); // Last 30 days

      mockPrisma.voteAbuseDetection.findMany.mockResolvedValue([
        {
          userId: 'user1',
          user: { name: 'Suspicious User', email: 'suspicious@test.com' },
          createdAt: new Date(),
          severity: VoteAbuseSeverity.HIGH,
        },
      ]);

      const stats = await monitoringService.getAbuseStatistics();

      expect(stats.totalDetections).toBe(15);
      expect(stats.recentTrends.last7d).toBe(50);
      expect(stats.recentTrends.last30d).toBe(100);
      expect(stats.topOffenders).toHaveLength(1);
    });
  });
}); 