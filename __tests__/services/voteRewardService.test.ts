import { VoteRewardService } from '@/lib/services/voteRewardService';
import { CreditService } from '@/lib/services/creditService';
import { AuditService } from '@/lib/services/auditService';
import { prisma } from '@/lib/prisma';
import { addDays, subDays, subHours } from 'date-fns';

// Define the enums manually for testing
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
  RAPID_VOTING: 'RAPID_VOTING',
  TEMPORAL_PATTERN_ABUSE: 'TEMPORAL_PATTERN_ABUSE',
  VOTE_MANIPULATION: 'VOTE_MANIPULATION',
  DEVICE_FINGERPRINT_MATCH: 'DEVICE_FINGERPRINT_MATCH',
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
  INVESTIGATING: 'INVESTIGATING',
  CONFIRMED: 'CONFIRMED',
  FALSE_POSITIVE: 'FALSE_POSITIVE',
  RESOLVED: 'RESOLVED',
} as const;

const CreditType = {
  UPVOTE: 'UPVOTE',
  PURCHASE: 'PURCHASE',
  BONUS: 'BONUS',
  REFUND: 'REFUND',
} as const;

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    vote: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    voteReward: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    voteAbuseDetection: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    votePattern: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    prompt: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock @prisma/client enums using jest.doMock to avoid hoisting issues
jest.doMock('@prisma/client', () => ({
  VoteAbuseType,
  VoteAbuseSeverity,
  VoteAbuseStatus,
  CreditType,
}));

jest.mock('@/lib/services/creditService', () => ({
  CreditService: {
    getInstance: jest.fn(() => ({
      addCredits: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    getInstance: jest.fn(() => ({
      logAudit: jest.fn(),
    })),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCreditService = {
  addCredits: jest.fn(),
};
const mockAuditService = {
  logAudit: jest.fn(),
};

// Mock the service instances
(CreditService.getInstance as jest.Mock).mockReturnValue(mockCreditService);
(AuditService.getInstance as jest.Mock).mockReturnValue(mockAuditService);

describe('VoteRewardService', () => {
  let voteRewardService: VoteRewardService;
  const mockVoterId = 'voter-123';
  const mockAuthorId = 'author-456';
  const mockPromptId = 'prompt-789';
  const mockVoteId = 'vote-abc';
  const mockIpAddress = '192.168.1.1';
  const mockUserAgent = 'Mozilla/5.0 Test Browser';

  beforeEach(() => {
    jest.clearAllMocks();
    voteRewardService = VoteRewardService.getInstance();
    
    // Setup default mocks
    mockCreditService.addCredits = jest.fn().mockResolvedValue(undefined);
    mockAuditService.logAudit = jest.fn().mockResolvedValue(undefined);
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
    
    // Mock aggregate functions with default values
    mockPrisma.voteReward.aggregate.mockResolvedValue({
      _sum: { creditsAwarded: 0 }
    } as any);
    
    mockPrisma.vote.count.mockResolvedValue(0);
    mockPrisma.voteAbuseDetection.count.mockResolvedValue(0);
    mockPrisma.vote.findMany.mockResolvedValue([]);
    mockPrisma.voteReward.findMany.mockResolvedValue([]);
    mockPrisma.votePattern.findMany.mockResolvedValue([]);
    mockPrisma.voteAbuseDetection.findMany.mockResolvedValue([]);
    mockPrisma.prompt.count.mockResolvedValue(0);
  });

  describe('processVoteReward', () => {
    beforeEach(() => {
      // Default voter setup - Pro user with valid account age
      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockVoterId,
        planType: PlanType.PRO,
        createdAt: subDays(new Date(), 30), // 30 days old account
      } as any);

      mockPrisma.voteReward.findUnique.mockResolvedValue(null); // No existing reward
    });

    describe('Basic Functionality', () => {
      it('should award 1 credit to Pro user for upvote', async () => {
        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1, // upvote
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(true);
        expect(result.creditsAwarded).toBe(1);
        expect(mockCreditService.addCredits).toHaveBeenCalledWith(
          mockAuthorId,
          1,
          CreditType.UPVOTE
        );
      });

      it('should award 2 credits to Elite user for upvote', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: mockVoterId,
          planType: PlanType.ELITE,
          createdAt: subDays(new Date(), 30),
        } as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(true);
        expect(result.creditsAwarded).toBe(2);
        expect(mockCreditService.addCredits).toHaveBeenCalledWith(
          mockAuthorId,
          2,
          CreditType.UPVOTE
        );
      });

      it('should award 3 credits to Enterprise user for upvote', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: mockVoterId,
          planType: PlanType.ENTERPRISE,
          createdAt: subDays(new Date(), 30),
        } as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(true);
        expect(result.creditsAwarded).toBe(3);
        expect(mockCreditService.addCredits).toHaveBeenCalledWith(
          mockAuthorId,
          3,
          CreditType.UPVOTE
        );
      });

      it('should not award credits to Free user', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: mockVoterId,
          planType: PlanType.FREE,
          createdAt: subDays(new Date(), 30),
        } as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.creditsAwarded).toBe(0);
        expect(result.reason).toBe('Plan does not earn credits from voting');
        expect(mockCreditService.addCredits).not.toHaveBeenCalled();
      });

      it('should not award credits for downvotes', async () => {
        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          -1, // downvote
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.creditsAwarded).toBe(0);
        expect(result.reason).toBe('Only upvotes earn credits');
        expect(mockCreditService.addCredits).not.toHaveBeenCalled();
      });
    });

    describe('Anti-Abuse: Self-Voting Prevention', () => {
      it('should prevent self-voting and log abuse', async () => {
        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockVoterId, // Same user as voter
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.creditsAwarded).toBe(0);
        expect(result.abuseDetected).toBe(true);
        expect(result.abuseType).toBe(VoteAbuseType.SELF_VOTE_ATTEMPT);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: mockVoterId,
            abuseType: VoteAbuseType.SELF_VOTE_ATTEMPT,
            severity: VoteAbuseSeverity.MEDIUM,
          }),
        });
      });
    });

    describe('Anti-Abuse: Account Age Verification', () => {
      it('should detect suspicious account age', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: mockVoterId,
          planType: PlanType.PRO,
          createdAt: subDays(new Date(), 1), // 1 day old account
        } as any);

        // Mock the abuse detection to trigger account age abuse
        mockPrisma.vote.count
          .mockResolvedValueOnce(5) // votes last hour
          .mockResolvedValueOnce(10); // votes last day

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(0); // No same IP votes
        mockPrisma.voteReward.findMany.mockResolvedValue([]); // No coordinated voting

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.SUSPICIOUS_ACCOUNT_AGE,
            severity: VoteAbuseSeverity.HIGH,
          }),
        });
      });
    });

    describe('Anti-Abuse: Rate Limiting', () => {
      it('should detect excessive voting rate per hour', async () => {
        mockPrisma.vote.count
          .mockResolvedValueOnce(25) // Exceeds 20 votes per hour limit
          .mockResolvedValueOnce(50); // votes last day

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 5 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(0);
        mockPrisma.voteReward.findMany.mockResolvedValue([]);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
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
          .mockResolvedValueOnce(10) // Normal hourly rate
          .mockResolvedValueOnce(150); // Exceeds 100 votes per day limit

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 5 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(0);
        mockPrisma.voteReward.findMany.mockResolvedValue([]);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.EXCESSIVE_VOTING_RATE,
            severity: VoteAbuseSeverity.MEDIUM,
          }),
        });
      });

      it('should detect excessive credits earned per hour', async () => {
        mockPrisma.vote.count
          .mockResolvedValueOnce(10) // Normal voting rate
          .mockResolvedValueOnce(50);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 15 } // Exceeds 10 credits per hour limit
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(0);
        mockPrisma.voteReward.findMany.mockResolvedValue([]);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
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
    });

    describe('Anti-Abuse: IP Clustering Detection', () => {
      it('should detect multiple votes from same IP', async () => {
        // Setup normal rate limits
        mockPrisma.vote.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(20);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        // Mock IP clustering - too many votes from same IP
        mockPrisma.voteReward.count.mockResolvedValue(60); // Exceeds 50 same IP votes per day

        mockPrisma.voteReward.findMany.mockResolvedValue([]);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
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

      it('should detect coordinated voting from same IP', async () => {
        // Setup normal rate limits
        mockPrisma.vote.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(20);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(10); // Normal IP usage

        // Mock coordinated voting - multiple users from same IP
        mockPrisma.voteReward.findMany.mockResolvedValue([
          { voterId: 'user1' },
          { voterId: 'user2' },
          { voterId: 'user3' },
          { voterId: 'user4' },
          { voterId: 'user5' },
          { voterId: 'user6' }, // 6 users exceeds 5 user limit
        ] as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.COORDINATED_VOTING,
            severity: VoteAbuseSeverity.HIGH,
          }),
        });
      });
    });

    describe('Anti-Abuse: Temporal Pattern Detection', () => {
      it('should detect rapid voting patterns', async () => {
        // Setup normal rate limits
        mockPrisma.vote.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(20);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(10);
        mockPrisma.voteReward.findMany.mockResolvedValue([]);

        // Mock rapid voting - 5 votes in 30 seconds
        const now = new Date();
        const rapidVotes = Array.from({ length: 5 }, (_, i) => ({
          id: `vote-${i}`,
          createdAt: new Date(now.getTime() - (i * 6000)), // 6 seconds apart
          userId: mockVoterId,
        }));

        mockPrisma.vote.findMany.mockResolvedValue(rapidVotes as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.RAPID_VOTING,
            severity: VoteAbuseSeverity.HIGH,
          }),
        });
      });

      it('should detect mechanical voting patterns', async () => {
        // Setup normal rate limits
        mockPrisma.vote.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(20);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(10);
        mockPrisma.voteReward.findMany.mockResolvedValue([]);

        // Mock mechanical voting - exact 10 second intervals
        const now = new Date();
        const mechanicalVotes = Array.from({ length: 6 }, (_, i) => ({
          id: `vote-${i}`,
          createdAt: new Date(now.getTime() - (i * 10000)), // Exactly 10 seconds apart
          userId: mockVoterId,
        }));

        mockPrisma.vote.findMany.mockResolvedValue(mechanicalVotes as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.TEMPORAL_PATTERN_ABUSE,
            severity: VoteAbuseSeverity.MEDIUM,
          }),
        });
      });
    });

    describe('Anti-Abuse: Same Author Voting Pattern', () => {
      it('should detect excessive voting on same author', async () => {
        // Setup normal rate limits
        mockPrisma.vote.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(20);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        mockPrisma.voteReward.count.mockResolvedValue(10);
        mockPrisma.voteReward.findMany.mockResolvedValue([]);
        mockPrisma.vote.findMany.mockResolvedValue([]);

        // Mock same author voting pattern
        mockPrisma.voteReward.count.mockResolvedValueOnce(8); // 8 votes on same author
        mockPrisma.prompt.count.mockResolvedValue(10); // Author has 10 prompts

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.VOTE_MANIPULATION,
            severity: VoteAbuseSeverity.MEDIUM,
          }),
        });
      });
    });

    describe('Anti-Abuse: Device Fingerprinting', () => {
      it('should detect multiple users with same user agent', async () => {
        // Setup normal conditions
        mockPrisma.vote.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(20);

        mockPrisma.voteReward.aggregate.mockResolvedValue({
          _sum: { creditsAwarded: 2 }
        } as any);

        mockPrisma.voteReward.count
          .mockResolvedValueOnce(10) // Normal IP usage
          .mockResolvedValueOnce(8); // Same author votes

        mockPrisma.voteReward.findMany
          .mockResolvedValueOnce([]) // No coordinated voting
          .mockResolvedValueOnce([ // Multiple users with same user agent
            { voterId: 'user1' },
            { voterId: 'user2' },
            { voterId: 'user3' },
            { voterId: 'user4' },
            { voterId: 'user5' },
            { voterId: 'user6' }, // 6 users with same user agent
          ] as any);

        mockPrisma.vote.findMany.mockResolvedValue([]);
        mockPrisma.prompt.count.mockResolvedValue(10);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.abuseDetected).toBe(true);
        expect(mockPrisma.voteAbuseDetection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            abuseType: VoteAbuseType.DEVICE_FINGERPRINT_MATCH,
            severity: VoteAbuseSeverity.MEDIUM,
          }),
        });
      });
    });

    describe('Duplicate Reward Prevention', () => {
      it('should prevent duplicate rewards for same vote', async () => {
        // Mock existing reward
        mockPrisma.voteReward.findUnique.mockResolvedValue({
          id: 'existing-reward',
          voteId: mockVoteId,
          creditsAwarded: 1,
        } as any);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.creditsAwarded).toBe(0);
        expect(result.reason).toBe('Reward already processed');
        expect(mockCreditService.addCredits).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle voter not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.creditsAwarded).toBe(0);
        expect(result.reason).toBe('Voter not found');
      });

      it('should handle database errors gracefully', async () => {
        mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

        const result = await voteRewardService.processVoteReward(
          mockVoteId,
          mockVoterId,
          mockAuthorId,
          mockPromptId,
          1,
          mockIpAddress,
          mockUserAgent
        );

        expect(result.success).toBe(false);
        expect(result.creditsAwarded).toBe(0);
        expect(result.reason).toBe('Internal error processing reward');
      });
    });
  });

  describe('getUserVotingStats', () => {
    it('should return user voting statistics and risk assessment', async () => {
      const mockPatterns = [
        {
          timeWindow: '1h',
          votesCount: 5,
          riskScore: 0.3,
          suspiciousPatterns: [],
          lastUpdated: new Date(),
        },
        {
          timeWindow: '24h',
          votesCount: 25,
          riskScore: 0.6,
          suspiciousPatterns: ['high_frequency'],
          lastUpdated: new Date(),
        },
      ];

      const mockRecentAbuse = [
        {
          id: 'abuse-1',
          abuseType: VoteAbuseType.RAPID_VOTING,
          severity: VoteAbuseSeverity.MEDIUM,
          detectedAt: new Date(),
        },
      ];

      mockPrisma.votePattern.findMany.mockResolvedValue(mockPatterns as any);
      mockPrisma.voteAbuseDetection.findMany.mockResolvedValue(mockRecentAbuse as any);
      mockPrisma.voteReward.aggregate.mockResolvedValue({
        _sum: { creditsAwarded: 50 }
      } as any);

      const result = await voteRewardService.getUserVotingStats(mockVoterId);

      expect(result.patterns).toEqual(mockPatterns);
      expect(result.riskScore).toBe(0.6); // Max risk score
      expect(result.recentAbuse).toEqual(mockRecentAbuse);
      expect(result.totalCreditsEarned).toBe(50);
    });
  });

  describe('investigateAbuse', () => {
    it('should successfully investigate and resolve abuse case', async () => {
      const abuseId = 'abuse-123';
      const investigatorId = 'admin-456';
      const resolution = 'False positive - legitimate voting pattern';
      const status = VoteAbuseStatus.FALSE_POSITIVE;

      mockPrisma.voteAbuseDetection.update.mockResolvedValue({
        id: abuseId,
        status,
        resolution,
      } as any);

      const result = await voteRewardService.investigateAbuse(
        abuseId,
        investigatorId,
        resolution,
        status
      );

      expect(result).toBe(true);
      expect(mockPrisma.voteAbuseDetection.update).toHaveBeenCalledWith({
        where: { id: abuseId },
        data: {
          status,
          investigatedBy: investigatorId,
          resolution,
          resolvedAt: expect.any(Date),
        },
      });
      expect(mockAuditService.logAudit).toHaveBeenCalled();
    });

    it('should handle investigation errors', async () => {
      mockPrisma.voteAbuseDetection.update.mockRejectedValue(new Error('Database error'));

      const result = await voteRewardService.investigateAbuse(
        'abuse-123',
        'admin-456',
        'Test resolution',
        VoteAbuseStatus.RESOLVED
      );

      expect(result).toBe(false);
    });
  });
}); 