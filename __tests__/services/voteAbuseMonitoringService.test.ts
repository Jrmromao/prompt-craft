// Mock all dependencies before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {
    voteAbuseDetection: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
    },
    vote: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    voteReward: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    votePattern: {
      upsert: jest.fn(),
    },
  },
}));

const mockPrisma = require('@/lib/prisma').prisma;

const mockEmailService = {
  sendEmail: jest.fn(),
};

const mockAuditService = {
  logAudit: jest.fn(),
};

jest.mock('@/lib/services/emailService', () => ({
  EmailService: {
    getInstance: () => mockEmailService,
  },
}));

jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    getInstance: () => mockAuditService,
  },
}));

// Define the enums manually for testing
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

// Import after mocking
//@ts-ignore
import { VoteAbuseMonitoringService } from '@/lib/services/voteAbuseMonitoringService';

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    ADMIN_EMAIL: 'admin@test.com',
    SECURITY_EMAIL: 'security@test.com',
    NEXTAUTH_URL: 'https://test.com',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('VoteAbuseMonitoringService', () => {
  let monitoringService: VoteAbuseMonitoringService;
  
  const mockAbuseAlert = {
    id: 'abuse-123',
    type: VoteAbuseType.RAPID_VOTING,
    severity: VoteAbuseSeverity.HIGH,
    userId: 'user-456',
    userEmail: 'user@test.com',
    userName: 'Test User',
    detectedAt: new Date(),
    details: {
      votesCount: 25,
      timeSpanSeconds: 30,
      threshold: 60,
      ipAddress: '192.168.1.1'
    },
    riskScore: 0.9,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    monitoringService = VoteAbuseMonitoringService.getInstance();
    
    // Setup default mocks
    mockEmailService.sendEmail.mockResolvedValue(undefined);
    mockAuditService.logAudit.mockResolvedValue(undefined);
    
    // Default Prisma mocks
    mockPrisma.voteAbuseDetection.count.mockResolvedValue(0);
    mockPrisma.vote.count.mockResolvedValue(0);
    mockPrisma.voteReward.count.mockResolvedValue(0);
    mockPrisma.votePattern.upsert.mockResolvedValue({});
  });

  describe('processAbuseAlert', () => {
    it('should send immediate alert for high severity abuse', async () => {
      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(2); // Two admin emails
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        subject: '🚨 High-Severity Vote Abuse Detected - RAPID_VOTING',
        html: expect.stringContaining('High-Severity Vote Abuse Alert'),
      });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'security@test.com',
        subject: '🚨 High-Severity Vote Abuse Detected - RAPID_VOTING',
        html: expect.stringContaining('High-Severity Vote Abuse Alert'),
      });
    });

    it('should not send immediate alert for low/medium severity abuse', async () => {
      const lowSeverityAlert = {
        ...mockAbuseAlert,
        severity: VoteAbuseSeverity.LOW,
      };

      await monitoringService.processAbuseAlert(lowSeverityAlert);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should check for coordinated attacks', async () => {
      // Mock coordinated attack detection
      mockPrisma.voteAbuseDetection.count.mockResolvedValue(5); // 5 detections from same IP

      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '🚨 Coordinated Vote Abuse Attack Detected',
        })
      );
    });

    it('should check for pattern attacks', async () => {
      // Mock pattern attack detection
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(2) // Normal coordinated attack count
        .mockResolvedValueOnce(6); // High pattern attack count

      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '🚨 Systematic Abuse Pattern Detected - RAPID_VOTING',
        })
      );
    });

    it('should check for system anomalies', async () => {
      // Mock system overload
      mockPrisma.vote.count.mockResolvedValue(1500); // Exceeds 1000 threshold
      mockPrisma.voteAbuseDetection.count.mockResolvedValue(150); // 10% abuse rate

      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '⚠️ System Overload Alert - High Vote Volume',
        })
      );
    });

    it('should log audit events', async () => {
      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockAuditService.logAudit).toHaveBeenCalledWith({
        userId: 'system',
        action: expect.any(String),
        resource: 'abuse_monitoring',
        details: expect.objectContaining({
          abuseId: 'abuse-123',
          type: 'RAPID_VOTING',
          severity: 'HIGH',
          userId: 'user-456',
        }),
      });
    });

    it('should update real-time statistics', async () => {
      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockPrisma.votePattern.upsert).toHaveBeenCalledWith({
        where: {
          userId_timeWindow: {
            userId: mockAbuseAlert.userId,
            timeWindow: 'abuse_tracking',
          },
        },
        update: expect.objectContaining({
          suspiciousPatterns: {
            push: expect.objectContaining({
              type: VoteAbuseType.RAPID_VOTING,
              severity: VoteAbuseSeverity.HIGH,
            }),
          },
          riskScore: { increment: 0.9 },
        }),
        create: expect.objectContaining({
          userId: mockAbuseAlert.userId,
          timeWindow: 'abuse_tracking',
          riskScore: 0.9,
        }),
      });
    });
  });

  describe('getAbuseStatistics', () => {
    it('should return comprehensive abuse statistics', async () => {
      // Mock statistics data
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(15) // Total detections
        .mockResolvedValueOnce(50) // Last 7 days
        .mockResolvedValueOnce(100); // Last 30 days

      mockPrisma.voteAbuseDetection.groupBy.mockResolvedValue([
        { abuseType: VoteAbuseType.RAPID_VOTING, _count: { abuseType: 30 } },
        { abuseType: VoteAbuseType.IP_CLUSTERING, _count: { abuseType: 20 } },
      ]);

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
      expect(stats.byType[VoteAbuseType.RAPID_VOTING]).toBe(30);
      expect(stats.byType[VoteAbuseType.IP_CLUSTERING]).toBe(20);
      expect(stats.bySeverity[VoteAbuseSeverity.HIGH]).toBe(40);
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health metrics', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(50) // Active cases
        .mockResolvedValueOnce(20) // Pending investigations
        .mockResolvedValueOnce(5) // False positives
        .mockResolvedValueOnce(100); // Total resolved

      mockPrisma.vote.count.mockResolvedValue(200); // Votes per hour
      mockPrisma.voteReward.count.mockResolvedValue(150); // Rewards per hour

      const health = await monitoringService.getSystemHealth();

      expect(health.activeAbuseCases).toBe(50);
      expect(health.pendingInvestigations).toBe(20);
      expect(health.falsePositiveRate).toBe(5);
      expect(health.averageResolutionTime).toBe(12);
      expect(health.systemLoad.votesPerHour).toBe(200);
      expect(health.systemLoad.rewardsPerHour).toBe(150);
      expect(health.systemLoad.abuseDetectionRate).toBe(8);
    });

    it('should handle zero division gracefully', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(0) // No active cases
        .mockResolvedValueOnce(0) // No pending investigations
        .mockResolvedValueOnce(0) // No false positives
        .mockResolvedValueOnce(0); // No resolved cases

      mockPrisma.vote.count.mockResolvedValue(0);
      mockPrisma.voteReward.count.mockResolvedValue(0);

      const health = await monitoringService.getSystemHealth();

      expect(health.falsePositiveRate).toBe(0);
      expect(health.averageResolutionTime).toBe(0);
      expect(health.systemLoad.abuseDetectionRate).toBe(0);
    });
  });

  describe('sendDailySummaryReport', () => {
    it('should send daily summary report to admin emails', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(15) // Total detections
        .mockResolvedValueOnce(50) // Last 7 days
        .mockResolvedValueOnce(100); // Last 30 days

      mockPrisma.voteAbuseDetection.groupBy.mockResolvedValue([
        { severity: VoteAbuseSeverity.HIGH, _count: { severity: 5 } },
        { severity: VoteAbuseSeverity.MEDIUM, _count: { severity: 7 } },
        { severity: VoteAbuseSeverity.LOW, _count: { severity: 3 } },
      ]);

      await monitoringService.sendDailySummaryReport();

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        subject: expect.stringContaining('Daily Vote Abuse Monitoring Report'),
        html: expect.any(String),
      });
    });

    it('should include system health information in report', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(15) // Total detections
        .mockResolvedValueOnce(50) // Last 7 days
        .mockResolvedValueOnce(100); // Last 30 days

      mockPrisma.voteAbuseDetection.groupBy.mockResolvedValue([
        { severity: VoteAbuseSeverity.HIGH, _count: { severity: 5 } },
        { severity: VoteAbuseSeverity.MEDIUM, _count: { severity: 7 } },
        { severity: VoteAbuseSeverity.LOW, _count: { severity: 3 } },
      ]);

      await monitoringService.sendDailySummaryReport();

      const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
      expect(emailCall.html).toContain('15'); // Total detections
      expect(emailCall.html).toContain('High: 5'); // High severity count
      expect(emailCall.html).toContain('Medium: 7'); // Medium severity count
    });

    it('should include top offenders when present', async () => {
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(15) // Total detections
        .mockResolvedValueOnce(50) // Last 7 days
        .mockResolvedValueOnce(100); // Last 30 days

      mockPrisma.voteAbuseDetection.groupBy.mockResolvedValue([
        { severity: VoteAbuseSeverity.HIGH, _count: { severity: 5 } },
      ]);

      mockPrisma.voteAbuseDetection.findMany.mockResolvedValue([
        {
          userId: 'user1',
          user: { name: 'Suspicious User', email: 'suspicious@test.com' },
          createdAt: new Date(),
          severity: VoteAbuseSeverity.HIGH,
        },
      ]);

      await monitoringService.sendDailySummaryReport();

      const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
      expect(emailCall.html).toContain('Top Offenders');
      expect(emailCall.html).toContain('Suspicious User');
      expect(emailCall.html).toContain('Detections: 10');
    });

    it('should include appropriate action recommendations', async () => {
      // Mock high false positive rate
      mockPrisma.voteAbuseDetection.count
        .mockResolvedValueOnce(15) // Total detections
        .mockResolvedValueOnce(50) // Last 7 days
        .mockResolvedValueOnce(100) // Last 30 days
        .mockResolvedValueOnce(50) // Active cases
        .mockResolvedValueOnce(20) // Pending investigations
        .mockResolvedValueOnce(15) // False positives
        .mockResolvedValueOnce(30); // Total resolved

      mockPrisma.voteAbuseDetection.groupBy.mockResolvedValue([]);

      await monitoringService.sendDailySummaryReport();

      const emailCall = mockEmailService.sendEmail.mock.calls[0][0];
      expect(emailCall.html).toContain('Review and investigate active abuse cases');
      expect(emailCall.html).toContain('High false positive rate');
      expect(emailCall.html).toContain('High abuse detection rate');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in getAbuseStatistics', async () => {
      mockPrisma.voteAbuseDetection.count.mockRejectedValue(new Error('Database error'));

      await expect(monitoringService.getAbuseStatistics()).rejects.toThrow('Database error');
    });

    it('should handle database errors in getSystemHealth', async () => {
      mockPrisma.voteAbuseDetection.count.mockRejectedValue(new Error('Database error'));

      await expect(monitoringService.getSystemHealth()).rejects.toThrow('Database error');
    });
  });

  describe('Alert Thresholds', () => {
    it('should respect abuse rate spike threshold', async () => {
      mockPrisma.voteAbuseDetection.count.mockResolvedValue(15); // High spike rate

      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '🚨 Abuse Detection Rate Spike Alert',
        })
      );
    });

    it('should respect system overload threshold', async () => {
      mockPrisma.vote.count.mockResolvedValue(1500); // High vote volume

      await monitoringService.processAbuseAlert(mockAbuseAlert);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '⚠️ System Overload Alert - High Vote Volume',
        })
      );
    });
  });

  describe('investigateAbuse', () => {
    it('should successfully investigate and resolve abuse case', async () => {
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
}); 