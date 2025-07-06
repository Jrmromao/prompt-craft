import { prisma } from '@/lib/prisma';
import { PlanType, VoteAbuseType, VoteAbuseSeverity, VoteAbuseStatus, CreditType } from '@prisma/client';
import { CreditService } from './creditService';
import { AuditService } from './auditService';
import { AuditAction } from '@/app/constants/audit';
import { addHours, addDays, subHours, subDays, isAfter, isBefore } from 'date-fns';

interface VoteRewardResult {
  success: boolean;
  creditsAwarded: number;
  reason?: string;
  abuseDetected?: boolean;
  abuseType?: VoteAbuseType;
}

interface AbusePattern {
  type: VoteAbuseType;
  severity: VoteAbuseSeverity;
  details: any;
  riskScore: number;
}

export class VoteRewardService {
  private static instance: VoteRewardService;
  private readonly creditService = CreditService.getInstance();
  private readonly auditService = AuditService.getInstance();

  // Anti-abuse configuration
  private readonly ABUSE_THRESHOLDS = {
    // Maximum votes per time window
    MAX_VOTES_PER_HOUR: 20,
    MAX_VOTES_PER_DAY: 100,
    MAX_VOTES_PER_WEEK: 500,
    
    // Maximum credits earned per time window
    MAX_CREDITS_PER_HOUR: 10,
    MAX_CREDITS_PER_DAY: 50,
    MAX_CREDITS_PER_WEEK: 200,
    
    // Minimum intervals between actions
    MIN_VOTE_INTERVAL_SECONDS: 5,
    MIN_SAME_AUTHOR_INTERVAL_MINUTES: 30,
    
    // Account age requirements
    MIN_ACCOUNT_AGE_DAYS: 3,
    MIN_ACCOUNT_AGE_FOR_HIGH_VALUE: 14,
    
    // Pattern detection
    MAX_CONSECUTIVE_VOTES: 10,
    MAX_SAME_IP_VOTES_PER_DAY: 50,
    SUSPICIOUS_RAPID_VOTING_WINDOW: 60, // seconds
    MAX_RAPID_VOTES: 5,
    
    // Risk scoring
    HIGH_RISK_THRESHOLD: 0.8,
    MEDIUM_RISK_THRESHOLD: 0.5,
    
    // Coordinated voting detection
    MAX_USERS_SAME_IP_TIMEFRAME: 5,
    COORDINATED_VOTING_WINDOW_HOURS: 2,
  };

  // Credit rewards by plan type
  private readonly CREDIT_REWARDS = {
    [PlanType.FREE]: 0,      // Free users don't earn credits from voting
    [PlanType.PRO]: 1,       // Pro users earn 1 credit per upvote
  };

  private constructor() {}

  public static getInstance(): VoteRewardService {
    if (!VoteRewardService.instance) {
      VoteRewardService.instance = new VoteRewardService();
    }
    return VoteRewardService.instance;
  }

  /**
   * Main method to process vote rewards with comprehensive anti-abuse checks
   */
  public async processVoteReward(
    voteId: string,
    voterId: string,
    promptAuthorId: string,
    promptId: string,
    voteValue: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<VoteRewardResult> {
    try {
      // Only process upvotes (value === 1)
      if (voteValue !== 1) {
        return { success: false, creditsAwarded: 0, reason: 'Only upvotes earn credits' };
      }

      // Prevent self-voting
      if (voterId === promptAuthorId) {
        await this.logAbuseAttempt(voterId, VoteAbuseType.SELF_VOTE_ATTEMPT, VoteAbuseSeverity.MEDIUM, {
          promptId,
          voteId,
          ipAddress,
          userAgent
        });
        return { success: false, creditsAwarded: 0, reason: 'Cannot vote on own prompts', abuseDetected: true, abuseType: VoteAbuseType.SELF_VOTE_ATTEMPT };
      }

      // Get voter's plan and check eligibility
      const voter = await prisma.user.findUnique({
        where: { id: voterId },
        select: { planType: true, createdAt: true }
      });

      if (!voter) {
        return { success: false, creditsAwarded: 0, reason: 'Voter not found' };
      }

      // Check if voter's plan earns credits
      const creditsToAward = this.CREDIT_REWARDS[voter.planType as keyof typeof this.CREDIT_REWARDS] || 0;
      if (creditsToAward === 0) {
        return { success: false, creditsAwarded: 0, reason: 'Plan does not earn credits from voting' };
      }

      // Comprehensive abuse detection
      const abuseCheck = await this.detectAbuse(voterId, promptAuthorId, promptId, ipAddress, userAgent, voter.createdAt);
      if (abuseCheck.length > 0) {
        // Log the most severe abuse detected
        const severestAbuse = abuseCheck.reduce((prev, current) => 
          current.severity > prev.severity ? current : prev
        );

        await this.logAbuseAttempt(voterId, severestAbuse.type, severestAbuse.severity, {
          promptId,
          voteId,
          ipAddress,
          userAgent,
          allDetectedPatterns: abuseCheck,
          riskScore: severestAbuse.riskScore
        });

        return { 
          success: false, 
          creditsAwarded: 0, 
          reason: 'Suspicious voting pattern detected', 
          abuseDetected: true, 
          abuseType: severestAbuse.type 
        };
      }

      // Check if reward already exists (prevent double rewards)
      const existingReward = await prisma.voteReward.findUnique({
        where: { voteId }
      });

      if (existingReward) {
        return { success: false, creditsAwarded: 0, reason: 'Reward already processed' };
      }

      // All checks passed - process the reward
      await prisma.$transaction(async (tx) => {
        // Award credits to prompt author
        await this.creditService.addCredits(promptAuthorId, creditsToAward, CreditType.UPVOTE);

        // Create reward record
        await tx.voteReward.create({
          data: {
            voteId,
            voterId,
            promptAuthorId,
            promptId,
            creditsAwarded: creditsToAward,
            voterPlanType: voter.planType,
            ipAddress,
            userAgent
          }
        });

        // Update vote patterns for monitoring
        await this.updateVotePatterns(voterId, creditsToAward);

        // Log successful reward
        await this.auditService.logAudit({
          userId: voterId,
          action: AuditAction.CREDITS_ADDED,
          resource: 'vote_reward',
          details: {
            promptId,
            promptAuthorId,
            creditsAwarded: creditsToAward,
            voterPlanType: voter.planType,
            ipAddress,
            userAgent
          }
        });
      });

      return { success: true, creditsAwarded: creditsToAward };

    } catch (error) {
      console.error('Error processing vote reward:', error);
      return { success: false, creditsAwarded: 0, reason: 'Internal error processing reward' };
    }
  }

  /**
   * Comprehensive abuse detection system
   */
  private async detectAbuse(
    voterId: string,
    promptAuthorId: string,
    promptId: string,
    ipAddress?: string,
    userAgent?: string,
    voterCreatedAt?: Date
  ): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // 1. Account age checks
    if (voterCreatedAt) {
      const accountAgeDays = (now.getTime() - voterCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (accountAgeDays < this.ABUSE_THRESHOLDS.MIN_ACCOUNT_AGE_DAYS) {
        patterns.push({
          type: VoteAbuseType.SUSPICIOUS_ACCOUNT_AGE,
          severity: VoteAbuseSeverity.HIGH,
          details: { accountAgeDays, minimumRequired: this.ABUSE_THRESHOLDS.MIN_ACCOUNT_AGE_DAYS },
          riskScore: 0.9
        });
      }
    }

    // 2. Rate limiting checks
    const rateLimitChecks = await this.checkRateLimits(voterId);
    patterns.push(...rateLimitChecks);

    // 3. IP-based abuse detection
    if (ipAddress) {
      const ipAbuseChecks = await this.checkIPAbuse(voterId, ipAddress);
      patterns.push(...ipAbuseChecks);
    }

    // 4. Temporal pattern analysis
    const temporalChecks = await this.checkTemporalPatterns(voterId);
    patterns.push(...temporalChecks);

    // 5. Coordinated voting detection
    const coordinatedChecks = await this.checkCoordinatedVoting(voterId, promptId, ipAddress);
    patterns.push(...coordinatedChecks);

    // 6. Same author voting pattern
    const sameAuthorChecks = await this.checkSameAuthorVoting(voterId, promptAuthorId);
    patterns.push(...sameAuthorChecks);

    // 7. Device fingerprinting (basic user agent analysis)
    if (userAgent) {
      const deviceChecks = await this.checkDeviceFingerprinting(voterId, userAgent);
      patterns.push(...deviceChecks);
    }

    return patterns.filter(p => p.riskScore >= this.ABUSE_THRESHOLDS.MEDIUM_RISK_THRESHOLD);
  }

  /**
   * Check voting rate limits
   */
  private async checkRateLimits(voterId: string): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // Check votes in last hour
    const votesLastHour = await prisma.vote.count({
      where: {
        userId: voterId,
        createdAt: { gte: subHours(now, 1) }
      }
    });

    if (votesLastHour >= this.ABUSE_THRESHOLDS.MAX_VOTES_PER_HOUR) {
      patterns.push({
        type: VoteAbuseType.EXCESSIVE_VOTING_RATE,
        severity: VoteAbuseSeverity.HIGH,
        details: { votesLastHour, threshold: this.ABUSE_THRESHOLDS.MAX_VOTES_PER_HOUR, timeWindow: '1 hour' },
        riskScore: 0.9
      });
    }

    // Check votes in last day
    const votesLastDay = await prisma.vote.count({
      where: {
        userId: voterId,
        createdAt: { gte: subDays(now, 1) }
      }
    });

    if (votesLastDay >= this.ABUSE_THRESHOLDS.MAX_VOTES_PER_DAY) {
      patterns.push({
        type: VoteAbuseType.EXCESSIVE_VOTING_RATE,
        severity: VoteAbuseSeverity.MEDIUM,
        details: { votesLastDay, threshold: this.ABUSE_THRESHOLDS.MAX_VOTES_PER_DAY, timeWindow: '1 day' },
        riskScore: 0.7
      });
    }

    // Check credits earned in last hour
    const creditsLastHour = await prisma.voteReward.aggregate({
      where: {
        voterId,
        createdAt: { gte: subHours(now, 1) }
      },
      _sum: { creditsAwarded: true }
    });

    if ((creditsLastHour._sum.creditsAwarded || 0) >= this.ABUSE_THRESHOLDS.MAX_CREDITS_PER_HOUR) {
      patterns.push({
        type: VoteAbuseType.EXCESSIVE_VOTING_RATE,
        severity: VoteAbuseSeverity.HIGH,
        details: { creditsLastHour: creditsLastHour._sum.creditsAwarded, threshold: this.ABUSE_THRESHOLDS.MAX_CREDITS_PER_HOUR },
        riskScore: 0.85
      });
    }

    return patterns;
  }

  /**
   * Check IP-based abuse patterns
   */
  private async checkIPAbuse(voterId: string, ipAddress: string): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // Check votes from same IP in last day
    const sameIPVotes = await prisma.voteReward.count({
      where: {
        ipAddress,
        createdAt: { gte: subDays(now, 1) }
      }
    });

    if (sameIPVotes >= this.ABUSE_THRESHOLDS.MAX_SAME_IP_VOTES_PER_DAY) {
      patterns.push({
        type: VoteAbuseType.IP_CLUSTERING,
        severity: VoteAbuseSeverity.HIGH,
        details: { sameIPVotes, threshold: this.ABUSE_THRESHOLDS.MAX_SAME_IP_VOTES_PER_DAY, ipAddress },
        riskScore: 0.8
      });
    }

    // Check for multiple users from same IP
    const usersFromSameIP = await prisma.voteReward.findMany({
      where: {
        ipAddress,
        createdAt: { gte: subHours(now, this.ABUSE_THRESHOLDS.COORDINATED_VOTING_WINDOW_HOURS) }
      },
      select: { voterId: true },
      distinct: ['voterId']
    });

    if (usersFromSameIP.length >= this.ABUSE_THRESHOLDS.MAX_USERS_SAME_IP_TIMEFRAME) {
      patterns.push({
        type: VoteAbuseType.COORDINATED_VOTING,
        severity: VoteAbuseSeverity.HIGH,
        details: { 
          uniqueUsers: usersFromSameIP.length, 
          threshold: this.ABUSE_THRESHOLDS.MAX_USERS_SAME_IP_TIMEFRAME,
          timeWindow: `${this.ABUSE_THRESHOLDS.COORDINATED_VOTING_WINDOW_HOURS} hours`,
          ipAddress 
        },
        riskScore: 0.9
      });
    }

    return patterns;
  }

  /**
   * Check temporal voting patterns
   */
  private async checkTemporalPatterns(voterId: string): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // Get recent votes
    const recentVotes = await prisma.vote.findMany({
      where: {
        userId: voterId,
        createdAt: { gte: subHours(now, 1) }
      },
      orderBy: { createdAt: 'desc' },
      take: this.ABUSE_THRESHOLDS.MAX_RAPID_VOTES + 5
    });

    if (recentVotes.length >= this.ABUSE_THRESHOLDS.MAX_RAPID_VOTES) {
      // Check for rapid voting (too many votes in short time)
      const rapidVotes = recentVotes.slice(0, this.ABUSE_THRESHOLDS.MAX_RAPID_VOTES);
      const timeSpan = rapidVotes[0].createdAt.getTime() - rapidVotes[rapidVotes.length - 1].createdAt.getTime();
      
      if (timeSpan < this.ABUSE_THRESHOLDS.SUSPICIOUS_RAPID_VOTING_WINDOW * 1000) {
        patterns.push({
          type: VoteAbuseType.RAPID_VOTING,
          severity: VoteAbuseSeverity.HIGH,
          details: { 
            votesCount: rapidVotes.length, 
            timeSpanSeconds: timeSpan / 1000,
            threshold: this.ABUSE_THRESHOLDS.SUSPICIOUS_RAPID_VOTING_WINDOW 
          },
          riskScore: 0.85
        });
      }
    }

    // Check for mechanical/bot-like patterns (votes at exact intervals)
    if (recentVotes.length >= 5) {
      const intervals = [];
      for (let i = 0; i < recentVotes.length - 1; i++) {
        const interval = recentVotes[i].createdAt.getTime() - recentVotes[i + 1].createdAt.getTime();
        intervals.push(interval);
      }

      // Check if intervals are suspiciously regular (within 5% variance)
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = standardDeviation / avgInterval;

      if (coefficientOfVariation < 0.05 && avgInterval < 30000) { // Less than 5% variation and less than 30 seconds average
        patterns.push({
          type: VoteAbuseType.TEMPORAL_PATTERN_ABUSE,
          severity: VoteAbuseSeverity.MEDIUM,
          details: { 
            avgIntervalSeconds: avgInterval / 1000,
            coefficientOfVariation,
            suspiciousRegularity: true 
          },
          riskScore: 0.6
        });
      }
    }

    return patterns;
  }

  /**
   * Check for coordinated voting patterns
   */
  private async checkCoordinatedVoting(voterId: string, promptId: string, ipAddress?: string): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // Check if multiple users voted on same prompt from same IP recently
    if (ipAddress) {
      const coordinatedVotes = await prisma.vote.findMany({
        where: {
          promptId,
          createdAt: { gte: subHours(now, this.ABUSE_THRESHOLDS.COORDINATED_VOTING_WINDOW_HOURS) }
        },
        include: {
          reward: {
            where: { ipAddress }
          }
        }
      });

      const sameIPVoters = coordinatedVotes.filter(vote => vote.reward && vote.reward.ipAddress === ipAddress);
      
      if (sameIPVoters.length >= 3) { // 3 or more users from same IP voting on same prompt
        patterns.push({
          type: VoteAbuseType.COORDINATED_VOTING,
          severity: VoteAbuseSeverity.HIGH,
          details: { 
            sameIPVoters: sameIPVoters.length,
            promptId,
            ipAddress,
            timeWindow: `${this.ABUSE_THRESHOLDS.COORDINATED_VOTING_WINDOW_HOURS} hours`
          },
          riskScore: 0.9
        });
      }
    }

    return patterns;
  }

  /**
   * Check same author voting patterns
   */
  private async checkSameAuthorVoting(voterId: string, promptAuthorId: string): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // Check how often this voter votes on this author's prompts
    const votesOnSameAuthor = await prisma.voteReward.count({
      where: {
        voterId,
        promptAuthorId,
        createdAt: { gte: subDays(now, 7) }
      }
    });

    // Check total prompts by this author that voter could have voted on
    const authorPrompts = await prisma.prompt.count({
      where: {
        userId: promptAuthorId,
        isPublic: true,
        createdAt: { lte: now }
      }
    });

    // If voter has voted on >80% of author's prompts, it's suspicious
    if (authorPrompts > 0 && (votesOnSameAuthor / authorPrompts) > 0.8) {
      patterns.push({
        type: VoteAbuseType.VOTE_MANIPULATION,
        severity: VoteAbuseSeverity.MEDIUM,
        details: { 
          votesOnAuthor: votesOnSameAuthor,
          totalAuthorPrompts: authorPrompts,
          percentage: (votesOnSameAuthor / authorPrompts) * 100
        },
        riskScore: 0.7
      });
    }

    return patterns;
  }

  /**
   * Check device fingerprinting patterns
   */
  private async checkDeviceFingerprinting(voterId: string, userAgent: string): Promise<AbusePattern[]> {
    const patterns: AbusePattern[] = [];
    const now = new Date();

    // Check for multiple users with exact same user agent
    const sameUserAgentUsers = await prisma.voteReward.findMany({
      where: {
        userAgent,
        createdAt: { gte: subDays(now, 1) }
      },
      select: { voterId: true },
      distinct: ['voterId']
    });

    if (sameUserAgentUsers.length >= 5) { // 5+ users with exact same user agent
      patterns.push({
        type: VoteAbuseType.DEVICE_FINGERPRINT_MATCH,
        severity: VoteAbuseSeverity.MEDIUM,
        details: { 
          uniqueUsers: sameUserAgentUsers.length,
          userAgent: userAgent.substring(0, 100) // Truncate for privacy
        },
        riskScore: 0.6
      });
    }

    return patterns;
  }

  /**
   * Log abuse attempt
   */
  private async logAbuseAttempt(
    userId: string,
    abuseType: VoteAbuseType,
    severity: VoteAbuseSeverity,
    details: any
  ): Promise<void> {
    try {
      await prisma.voteAbuseDetection.create({
        data: {
          userId,
          abuseType,
          severity,
          details,
          status: VoteAbuseStatus.PENDING
        }
      });

      // Log to audit system
      await this.auditService.logAudit({
        userId,
        action: AuditAction.SECURITY_ALERT,
        resource: 'vote_abuse',
        details: {
          abuseType,
          severity,
          details
        }
      });
    } catch (error) {
      console.error('Error logging abuse attempt:', error);
    }
  }

  /**
   * Update vote patterns for monitoring
   */
  private async updateVotePatterns(voterId: string, creditsEarned: number): Promise<void> {
    const timeWindows = ['1h', '24h', '7d'];
    const now = new Date();

    for (const window of timeWindows) {
      try {
        const windowStart = window === '1h' ? subHours(now, 1) : 
                           window === '24h' ? subDays(now, 1) : 
                           subDays(now, 7);

        // Get vote statistics for this time window
        const votes = await prisma.vote.findMany({
          where: {
            userId: voterId,
            createdAt: { gte: windowStart }
          },
          include: {
            prompt: {
              select: { userId: true }
            }
          }
        });

        const upvotes = votes.filter(v => v.value === 1).length;
        const downvotes = votes.filter(v => v.value === -1).length;
        const uniquePrompts = new Set(votes.map(v => v.promptId)).size;
        const uniqueAuthors = new Set(votes.map(v => v.prompt.userId)).size;

        // Calculate risk score based on patterns
        let riskScore = 0;
        const suspiciousPatterns = [];

        // High vote frequency
        if (window === '1h' && votes.length > 10) {
          riskScore += 0.3;
          suspiciousPatterns.push('high_hourly_frequency');
        }

        // Low author diversity
        if (uniquePrompts > 0 && (uniqueAuthors / uniquePrompts) < 0.3) {
          riskScore += 0.2;
          suspiciousPatterns.push('low_author_diversity');
        }

        // Upsert vote pattern record
        await prisma.votePattern.upsert({
          where: {
            userId_timeWindow: {
              userId: voterId,
              timeWindow: window
            }
          },
          update: {
            votesCount: votes.length,
            upvotesCount: upvotes,
            downvotesCount: downvotes,
            uniquePromptsVoted: uniquePrompts,
            uniqueAuthorsVoted: uniqueAuthors,
            creditsEarned: window === '1h' ? creditsEarned : { increment: creditsEarned },
            suspiciousPatterns: suspiciousPatterns,
            riskScore,
            lastUpdated: now
          },
          create: {
            userId: voterId,
            timeWindow: window,
            votesCount: votes.length,
            upvotesCount: upvotes,
            downvotesCount: downvotes,
            uniquePromptsVoted: uniquePrompts,
            uniqueAuthorsVoted: uniqueAuthors,
            creditsEarned,
            suspiciousPatterns: suspiciousPatterns,
            riskScore,
            lastUpdated: now
          }
        });
      } catch (error) {
        console.error(`Error updating vote pattern for window ${window}:`, error);
      }
    }
  }

  /**
   * Get user's voting statistics and risk assessment
   */
  public async getUserVotingStats(userId: string): Promise<{
    patterns: any[];
    riskScore: number;
    recentAbuse: any[];
    totalCreditsEarned: number;
  }> {
    const [patterns, recentAbuse, totalRewards] = await Promise.all([
      prisma.votePattern.findMany({
        where: { userId },
        orderBy: { lastUpdated: 'desc' }
      }),
      prisma.voteAbuseDetection.findMany({
        where: { 
          userId,
          detectedAt: { gte: subDays(new Date(), 30) }
        },
        orderBy: { detectedAt: 'desc' },
        take: 10
      }),
      prisma.voteReward.aggregate({
        where: { voterId: userId },
        _sum: { creditsAwarded: true }
      })
    ]);

    const maxRiskScore = Math.max(...patterns.map(p => p.riskScore), 0);
    
    return {
      patterns,
      riskScore: maxRiskScore,
      recentAbuse,
      totalCreditsEarned: totalRewards._sum.creditsAwarded || 0
    };
  }

  /**
   * Admin method to investigate and resolve abuse cases
   */
  public async investigateAbuse(
    abuseId: string,
    investigatorId: string,
    resolution: string,
    status: VoteAbuseStatus
  ): Promise<boolean> {
    try {
      await prisma.voteAbuseDetection.update({
        where: { id: abuseId },
        data: {
          status,
          investigatedBy: investigatorId,
          resolution,
          resolvedAt: new Date()
        }
      });

      await this.auditService.logAudit({
        userId: investigatorId,
        action: AuditAction.ADMIN_ACTION,
        resource: 'abuse_investigation',
        details: {
          abuseId,
          resolution,
          status
        }
      });

      return true;
    } catch (error) {
      console.error('Error investigating abuse:', error);
      return false;
    }
  }
} 