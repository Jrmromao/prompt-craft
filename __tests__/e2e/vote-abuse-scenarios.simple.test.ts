// Simplified E2E Vote Abuse Scenarios
// This tests the overall flow and logic without complex service mocking

describe('Vote Abuse Scenarios - E2E Logic Tests', () => {
  // Define enum constants to avoid Prisma import issues
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
    SOCKPUPPET_VOTING: 'SOCKPUPPET_VOTING'
  };

  const VoteAbuseSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  };

  const VoteAbuseStatus = {
    PENDING: 'PENDING',
    INVESTIGATING: 'INVESTIGATING',
    CONFIRMED: 'CONFIRMED',
    FALSE_POSITIVE: 'FALSE_POSITIVE',
    RESOLVED: 'RESOLVED'
  };

  const PlanType = {
    FREE: 'FREE',
    PRO: 'PRO',
    ELITE: 'ELITE',
    ENTERPRISE: 'ENTERPRISE'
  };

  // Mock comprehensive abuse detection system
  class MockVoteAbuseSystem {
    private abuseDetections: Array<{
      id: string;
      type: string;
      severity: string;
      status: string;
      userId: string;
      riskScore: number;
      detectedAt: Date;
      details: any;
    }> = [];

    private systemHealth = {
      activeCases: 0,
      pendingInvestigations: 0,
      falsePositiveRate: 0.05,
      averageResolutionTime: 24.5,
      systemStatus: 'healthy'
    };

    // Simulate comprehensive abuse detection
    async detectAbuse(scenario: {
      userId: string;
      authorId: string;
      userCreatedAt: Date;
      voteValue: number;
      ipAddress: string;
      userAgent: string;
      recentVotes: Date[];
      votesOnAuthor: number;
      userPlan: string;
      votesFromIp: number;
      usersFromIp: number;
      hourlyVotes: number;
      dailyVotes: number;
      weeklyVotes: number;
    }): Promise<{
      success: boolean;
      creditsAwarded: number;
      abuseDetected: boolean;
      abuseType?: string;
      severity?: string;
      riskScore: number;
      detections: Array<{ type: string; severity: string; details: any }>;
    }> {
      const detections: Array<{ type: string; severity: string; details: any }> = [];
      let riskScore = 0;

      // 1. Self-voting detection
      if (scenario.userId === scenario.authorId) {
        detections.push({
          type: VoteAbuseType.SELF_VOTE_ATTEMPT,
          severity: VoteAbuseSeverity.MEDIUM,
          details: { userId: scenario.userId, authorId: scenario.authorId }
        });
        riskScore += 0.3;
      }

      // 2. Account age verification
      const accountAge = Date.now() - scenario.userCreatedAt.getTime();
      const minAccountAge = 3 * 24 * 60 * 60 * 1000; // 3 days
      if (accountAge < minAccountAge) {
        detections.push({
          type: VoteAbuseType.SUSPICIOUS_ACCOUNT_AGE,
          severity: VoteAbuseSeverity.MEDIUM,
          details: { accountAgeDays: accountAge / (24 * 60 * 60 * 1000) }
        });
        riskScore += 0.3;
      }

      // 3. Rate limiting
      if (scenario.hourlyVotes > 20) {
        detections.push({
          type: VoteAbuseType.EXCESSIVE_VOTING_RATE,
          severity: VoteAbuseSeverity.HIGH,
          details: { hourlyVotes: scenario.hourlyVotes, limit: 20 }
        });
        riskScore += 0.6;
      }

      if (scenario.dailyVotes > 100) {
        detections.push({
          type: VoteAbuseType.EXCESSIVE_VOTING_RATE,
          severity: VoteAbuseSeverity.HIGH,
          details: { dailyVotes: scenario.dailyVotes, limit: 100 }
        });
        riskScore += 0.6;
      }

      // 4. IP clustering detection
      if (scenario.votesFromIp > 50) {
        detections.push({
          type: VoteAbuseType.IP_CLUSTERING,
          severity: VoteAbuseSeverity.HIGH,
          details: { votesFromIp: scenario.votesFromIp, limit: 50 }
        });
        riskScore += 0.6;
      }

      if (scenario.usersFromIp > 5) {
        detections.push({
          type: VoteAbuseType.COORDINATED_VOTING,
          severity: VoteAbuseSeverity.HIGH,
          details: { usersFromIp: scenario.usersFromIp, limit: 5 }
        });
        riskScore += 0.6;
      }

      // 5. Rapid voting detection
      const now = Date.now();
      const recentVotesInWindow = scenario.recentVotes.filter(
        voteTime => (now - voteTime.getTime()) <= 30000 // 30 seconds
      );
      if (recentVotesInWindow.length > 5) {
        detections.push({
          type: VoteAbuseType.RAPID_VOTING_PATTERN,
          severity: VoteAbuseSeverity.HIGH,
          details: { votesInWindow: recentVotesInWindow.length, window: '30s' }
        });
        riskScore += 0.6;
      }

      // 6. Vote manipulation detection
      if (scenario.votesOnAuthor > 10) {
        detections.push({
          type: VoteAbuseType.VOTE_MANIPULATION,
          severity: VoteAbuseSeverity.MEDIUM,
          details: { votesOnAuthor: scenario.votesOnAuthor, limit: 10 }
        });
        riskScore += 0.3;
      }

      // Cap risk score at 1.0
      riskScore = Math.min(riskScore, 1.0);

      // Calculate credits (only for upvotes and if no high-risk abuse)
      let creditsAwarded = 0;
      const abuseDetected = detections.length > 0;
      const highRiskAbuse = riskScore > 0.5;

      if (scenario.voteValue === 1 && !highRiskAbuse) {
        switch (scenario.userPlan) {
          case PlanType.PRO: creditsAwarded = 1; break;
          case PlanType.ELITE: creditsAwarded = 2; break;
          case PlanType.ENTERPRISE: creditsAwarded = 3; break;
          default: creditsAwarded = 0;
        }
      }

      // Store detection for monitoring
      if (abuseDetected) {
        const detection = {
          id: `detection-${Date.now()}`,
          type: detections[0].type,
          severity: detections[0].severity,
          status: VoteAbuseStatus.PENDING,
          userId: scenario.userId,
          riskScore,
          detectedAt: new Date(),
          details: detections
        };
        this.abuseDetections.push(detection);
        this.systemHealth.activeCases++;
      }

      return {
        success: true,
        creditsAwarded,
        abuseDetected,
        abuseType: detections[0]?.type,
        severity: detections[0]?.severity,
        riskScore,
        detections
      };
    }

    // Get system health metrics
    getSystemHealth() {
      return {
        ...this.systemHealth,
        lastUpdated: new Date().toISOString()
      };
    }

    // Get abuse statistics
    getAbuseStatistics() {
      const byType: { [key: string]: number } = {};
      const bySeverity: { [key: string]: number } = {};
      const byStatus: { [key: string]: number } = {};

      this.abuseDetections.forEach(detection => {
        byType[detection.type] = (byType[detection.type] || 0) + 1;
        bySeverity[detection.severity] = (bySeverity[detection.severity] || 0) + 1;
        byStatus[detection.status] = (byStatus[detection.status] || 0) + 1;
      });

      return {
        totalDetections: this.abuseDetections.length,
        byType,
        bySeverity,
        byStatus,
        timeRange: '30d'
      };
    }

    // Investigate abuse case
    async investigateAbuse(detectionId: string, resolution: string, status: string) {
      const detection = this.abuseDetections.find(d => d.id === detectionId);
      if (!detection) {
        throw new Error('Detection not found');
      }

      detection.status = status;
      
      if (status === VoteAbuseStatus.RESOLVED || status === VoteAbuseStatus.FALSE_POSITIVE) {
        this.systemHealth.activeCases = Math.max(0, this.systemHealth.activeCases - 1);
      }

      return {
        success: true,
        id: detectionId,
        status,
        resolution,
        investigatedAt: new Date().toISOString()
      };
    }
  }

  let abuseSystem: MockVoteAbuseSystem;

  beforeEach(() => {
    abuseSystem = new MockVoteAbuseSystem();
  });

  describe('Legitimate User Scenarios', () => {
    it('should handle normal voting behavior', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        recentVotes: [new Date(Date.now() - 300000)], // 5 minutes ago
        votesOnAuthor: 2,
        userPlan: PlanType.PRO,
        votesFromIp: 10,
        usersFromIp: 3,
        hourlyVotes: 5,
        dailyVotes: 20,
        weeklyVotes: 100
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.success).toBe(true);
      expect(result.creditsAwarded).toBe(1);
      expect(result.abuseDetected).toBe(false);
      expect(result.riskScore).toBe(0);
      expect(result.detections).toHaveLength(0);
    });

    it('should award appropriate credits based on plan', async () => {
      const baseScenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        votesFromIp: 5,
        usersFromIp: 2,
        hourlyVotes: 3,
        dailyVotes: 10,
        weeklyVotes: 30
      };

      const plans = [
        { plan: PlanType.FREE, expectedCredits: 0 },
        { plan: PlanType.PRO, expectedCredits: 1 },
        { plan: PlanType.ELITE, expectedCredits: 2 },
        { plan: PlanType.ENTERPRISE, expectedCredits: 3 }
      ];

      for (const { plan, expectedCredits } of plans) {
        const result = await abuseSystem.detectAbuse({
          ...baseScenario,
          userPlan: plan
        });

        expect(result.creditsAwarded).toBe(expectedCredits);
        expect(result.abuseDetected).toBe(false);
      }
    });
  });

  describe('Abuse Detection Scenarios', () => {
    it('should detect self-voting attempts', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'user-123', // Same user
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 5,
        usersFromIp: 2,
        hourlyVotes: 3,
        dailyVotes: 10,
        weeklyVotes: 30
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.abuseType).toBe(VoteAbuseType.SELF_VOTE_ATTEMPT);
      expect(result.severity).toBe(VoteAbuseSeverity.MEDIUM);
      expect(result.creditsAwarded).toBe(1); // Still awarded since not high risk
      expect(result.riskScore).toBe(0.3);
    });

    it('should detect suspicious account age', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day old
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 5,
        usersFromIp: 2,
        hourlyVotes: 3,
        dailyVotes: 10,
        weeklyVotes: 30
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.abuseType).toBe(VoteAbuseType.SUSPICIOUS_ACCOUNT_AGE);
      expect(result.severity).toBe(VoteAbuseSeverity.MEDIUM);
      expect(result.creditsAwarded).toBe(1); // Still awarded since not high risk
      expect(result.riskScore).toBe(0.3);
    });

    it('should detect excessive voting rate', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 5,
        usersFromIp: 2,
        hourlyVotes: 25, // Over limit
        dailyVotes: 120, // Over limit
        weeklyVotes: 300
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.abuseType).toBe(VoteAbuseType.EXCESSIVE_VOTING_RATE);
      expect(result.severity).toBe(VoteAbuseSeverity.HIGH);
      expect(result.creditsAwarded).toBe(0); // No credits due to high risk
      expect(result.riskScore).toBeGreaterThan(0.5);
    });

    it('should detect IP clustering abuse', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 60, // Over limit
        usersFromIp: 8, // Over limit
        hourlyVotes: 5,
        dailyVotes: 20,
        weeklyVotes: 100
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.detections).toHaveLength(2); // IP clustering + coordinated voting
      expect(result.detections[0].type).toBe(VoteAbuseType.IP_CLUSTERING);
      expect(result.detections[1].type).toBe(VoteAbuseType.COORDINATED_VOTING);
      expect(result.creditsAwarded).toBe(0); // No credits due to high risk
      expect(result.riskScore).toBeGreaterThan(0.5);
    });

    it('should detect rapid voting patterns', async () => {
      const now = new Date();
      const recentVotes = [
        new Date(now.getTime() - 5000),  // 5 seconds ago
        new Date(now.getTime() - 10000), // 10 seconds ago
        new Date(now.getTime() - 15000), // 15 seconds ago
        new Date(now.getTime() - 20000), // 20 seconds ago
        new Date(now.getTime() - 25000), // 25 seconds ago
        new Date(now.getTime() - 28000), // 28 seconds ago (6 votes in 30 seconds)
      ];

      const scenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes,
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 10,
        usersFromIp: 3,
        hourlyVotes: 15,
        dailyVotes: 50,
        weeklyVotes: 200
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.abuseType).toBe(VoteAbuseType.RAPID_VOTING_PATTERN);
      expect(result.severity).toBe(VoteAbuseSeverity.HIGH);
      expect(result.creditsAwarded).toBe(0); // No credits due to high risk
      expect(result.riskScore).toBeGreaterThan(0.5);
    });

    it('should detect vote manipulation', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 15, // Over limit
        userPlan: PlanType.PRO,
        votesFromIp: 10,
        usersFromIp: 3,
        hourlyVotes: 5,
        dailyVotes: 20,
        weeklyVotes: 100
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.abuseType).toBe(VoteAbuseType.VOTE_MANIPULATION);
      expect(result.severity).toBe(VoteAbuseSeverity.MEDIUM);
      expect(result.creditsAwarded).toBe(1); // Still awarded since not high risk
      expect(result.riskScore).toBe(0.3);
    });
  });

  describe('Complex Abuse Scenarios', () => {
    it('should handle multiple abuse patterns', async () => {
      const now = new Date();
      const scenario = {
        userId: 'user-123',
        authorId: 'user-123', // Self-voting
        userCreatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours old
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: Array.from({ length: 6 }, (_, i) => 
          new Date(now.getTime() - i * 5000) // 6 votes in 25 seconds
        ),
        votesOnAuthor: 15, // Over limit
        userPlan: PlanType.PRO,
        votesFromIp: 60, // Over limit
        usersFromIp: 8, // Over limit
        hourlyVotes: 25, // Over limit
        dailyVotes: 120, // Over limit
        weeklyVotes: 300
      };

      const result = await abuseSystem.detectAbuse(scenario);

      expect(result.abuseDetected).toBe(true);
      expect(result.detections.length).toBeGreaterThan(5); // Multiple abuse types
      expect(result.creditsAwarded).toBe(0); // No credits due to high risk
      expect(result.riskScore).toBe(1.0); // Capped at maximum risk
    });

    it('should handle high-risk vs medium-risk credit decisions', async () => {
      // Medium risk scenario - should still award credits
      const mediumRiskScenario = {
        userId: 'user-123',
        authorId: 'author-456',
        userCreatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day old (triggers SUSPICIOUS_ACCOUNT_AGE - 0.3 risk)
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 5, // Within limit
        userPlan: PlanType.PRO,
        votesFromIp: 10,
        usersFromIp: 3,
        hourlyVotes: 5,
        dailyVotes: 20,
        weeklyVotes: 100
      };

      const mediumResult = await abuseSystem.detectAbuse(mediumRiskScenario);
      expect(mediumResult.creditsAwarded).toBe(1); // Still awarded (risk = 0.3, under 0.5 threshold)
      expect(mediumResult.riskScore).toBe(0.3);

      // High risk scenario - should not award credits
      const highRiskScenario = {
        ...mediumRiskScenario,
        hourlyVotes: 25, // Over limit (adds 0.6 risk)
        dailyVotes: 120, // Over limit (adds 0.6 risk)
      };

      const highResult = await abuseSystem.detectAbuse(highRiskScenario);
      expect(highResult.creditsAwarded).toBe(0); // No credits (risk > 0.5)
      expect(highResult.riskScore).toBeGreaterThan(0.5);
    });
  });

  describe('System Health and Monitoring', () => {
    it('should track system health metrics', async () => {
      const health = abuseSystem.getSystemHealth();
      
      expect(health.activeCases).toBe(0);
      expect(health.pendingInvestigations).toBe(0);
      expect(health.falsePositiveRate).toBe(0.05);
      expect(health.systemStatus).toBe('healthy');
      expect(health.lastUpdated).toBeDefined();
    });

    it('should update system health when abuse is detected', async () => {
      const scenario = {
        userId: 'user-123',
        authorId: 'user-123', // Self-voting
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 5,
        usersFromIp: 2,
        hourlyVotes: 3,
        dailyVotes: 10,
        weeklyVotes: 30
      };

      await abuseSystem.detectAbuse(scenario);
      
      const health = abuseSystem.getSystemHealth();
      expect(health.activeCases).toBe(1);
    });

    it('should generate abuse statistics', async () => {
      // Create some abuse cases
      const scenarios = [
        {
          userId: 'user-1',
          authorId: 'user-1',
          userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          voteValue: 1,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          recentVotes: [],
          votesOnAuthor: 1,
          userPlan: PlanType.PRO,
          votesFromIp: 5,
          usersFromIp: 2,
          hourlyVotes: 3,
          dailyVotes: 10,
          weeklyVotes: 30
        },
        {
          userId: 'user-2',
          authorId: 'author-456',
          userCreatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day old
          voteValue: 1,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0',
          recentVotes: [],
          votesOnAuthor: 1,
          userPlan: PlanType.PRO,
          votesFromIp: 5,
          usersFromIp: 2,
          hourlyVotes: 3,
          dailyVotes: 10,
          weeklyVotes: 30
        }
      ];

      for (const scenario of scenarios) {
        await abuseSystem.detectAbuse(scenario);
      }

      const stats = abuseSystem.getAbuseStatistics();
      
      expect(stats.totalDetections).toBe(2);
      expect(stats.byType[VoteAbuseType.SELF_VOTE_ATTEMPT]).toBe(1);
      expect(stats.byType[VoteAbuseType.SUSPICIOUS_ACCOUNT_AGE]).toBe(1);
      expect(stats.bySeverity[VoteAbuseSeverity.MEDIUM]).toBe(2);
      expect(stats.byStatus[VoteAbuseStatus.PENDING]).toBe(2);
    });
  });

  describe('Investigation Workflow', () => {
    it('should handle abuse case investigation', async () => {
      // Create an abuse case
      const scenario = {
        userId: 'user-123',
        authorId: 'user-123',
        userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        voteValue: 1,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        recentVotes: [],
        votesOnAuthor: 1,
        userPlan: PlanType.PRO,
        votesFromIp: 5,
        usersFromIp: 2,
        hourlyVotes: 3,
        dailyVotes: 10,
        weeklyVotes: 30
      };

      const result = await abuseSystem.detectAbuse(scenario);
      expect(result.abuseDetected).toBe(true);

      // Get the detection ID from the system (it was created with timestamp)
      const stats = abuseSystem.getAbuseStatistics();
      expect(stats.totalDetections).toBe(1);

      // Get the actual detection ID from the internal array
      const detectionId = abuseSystem['abuseDetections'][0].id;
      
      // Investigate the case
      const investigation = await abuseSystem.investigateAbuse(
        detectionId,
        'False positive - legitimate user behavior',
        VoteAbuseStatus.FALSE_POSITIVE
      );

      expect(investigation.success).toBe(true);
      expect(investigation.status).toBe(VoteAbuseStatus.FALSE_POSITIVE);
      expect(investigation.resolution).toBe('False positive - legitimate user behavior');
      expect(investigation.investigatedAt).toBeDefined();
    });

    it('should handle investigation errors', async () => {
      await expect(
        abuseSystem.investigateAbuse('non-existent-id', 'Test resolution', VoteAbuseStatus.RESOLVED)
      ).rejects.toThrow('Detection not found');
    });
  });
}); 