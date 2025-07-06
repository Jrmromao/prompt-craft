import { prisma } from '@/lib/prisma';
import { VoteAbuseType, VoteAbuseSeverity, VoteAbuseStatus } from '@prisma/client';
import { EmailService } from './emailService';
import { AuditService } from './auditService';
import { AuditAction } from '@/app/constants/audit';
import { addDays, subDays, subHours, startOfDay, endOfDay } from 'date-fns';

interface AbuseAlert {
  id: string;
  type: VoteAbuseType;
  severity: VoteAbuseSeverity;
  userId: string;
  userEmail?: string;
  userName?: string;
  detectedAt: Date;
  details: any;
  riskScore: number;
}

interface AbuseStats {
  totalDetections: number;
  byType: Record<VoteAbuseType, number>;
  bySeverity: Record<VoteAbuseSeverity, number>;
  byStatus: Record<VoteAbuseStatus, number>;
  recentTrends: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  topOffenders: Array<{
    userId: string;
    userName?: string;
    userEmail?: string;
    detectionCount: number;
    highestSeverity: VoteAbuseSeverity;
    latestDetection: Date;
  }>;
}

interface SystemHealth {
  activeAbuseCases: number;
  pendingInvestigations: number;
  falsePositiveRate: number;
  averageResolutionTime: number; // in hours
  systemLoad: {
    votesPerHour: number;
    rewardsPerHour: number;
    abuseDetectionRate: number;
  };
}

export class VoteAbuseMonitoringService {
  private static instance: VoteAbuseMonitoringService;
  private readonly emailService = EmailService.getInstance();
  private readonly auditService = AuditService.getInstance();

  // Alert thresholds
  private readonly ALERT_THRESHOLDS = {
    HIGH_SEVERITY_IMMEDIATE: 1, // Send immediate alert for any high/critical severity
    MEDIUM_SEVERITY_BATCH: 5,   // Send batch alert when 5+ medium severity in 1 hour
    ABUSE_RATE_SPIKE: 0.1,      // Alert if abuse rate > 10% of total votes
    COORDINATED_ATTACK: 3,      // Alert if 3+ users from same IP detected
    SYSTEM_OVERLOAD: 1000,      // Alert if >1000 votes per hour
  };

  // Admin notification settings
  private readonly ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL,
    process.env.SECURITY_EMAIL
  ].filter(Boolean);

  private constructor() {}

  public static getInstance(): VoteAbuseMonitoringService {
    if (!VoteAbuseMonitoringService.instance) {
      VoteAbuseMonitoringService.instance = new VoteAbuseMonitoringService();
    }
    return VoteAbuseMonitoringService.instance;
  }

  /**
   * Real-time monitoring - called after each abuse detection
   */
  public async processAbuseAlert(abuseDetection: AbuseAlert): Promise<void> {
    try {
      // Immediate alerts for high/critical severity
      if (abuseDetection.severity === VoteAbuseSeverity.HIGH || 
          abuseDetection.severity === VoteAbuseSeverity.CRITICAL) {
        await this.sendImmediateAlert(abuseDetection);
      }

      // Check for coordinated attacks
      await this.checkCoordinatedAttacks(abuseDetection);

      // Update real-time statistics
      await this.updateRealTimeStats(abuseDetection);

      // Check for system-wide anomalies
      await this.checkSystemAnomalies();

      // Log the monitoring activity
      await this.auditService.logAudit({
        userId: 'system',
        action: AuditAction.SECURITY_ALERT,
        resource: 'abuse_monitoring',
        details: {
          abuseId: abuseDetection.id,
          type: abuseDetection.type,
          severity: abuseDetection.severity,
          userId: abuseDetection.userId
        }
      });

    } catch (error) {
      console.error('Error processing abuse alert:', error);
    }
  }

  /**
   * Send immediate alert for high-severity abuse
   */
  private async sendImmediateAlert(abuseDetection: AbuseAlert): Promise<void> {
    const subject = `🚨 High-Severity Vote Abuse Detected - ${abuseDetection.type}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #dc2626;">High-Severity Vote Abuse Alert</h2>
        
        <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <h3>Abuse Details</h3>
          <p><strong>Type:</strong> ${abuseDetection.type}</p>
          <p><strong>Severity:</strong> ${abuseDetection.severity}</p>
          <p><strong>Risk Score:</strong> ${abuseDetection.riskScore}</p>
          <p><strong>User ID:</strong> ${abuseDetection.userId}</p>
          <p><strong>User Email:</strong> ${abuseDetection.userEmail || 'N/A'}</p>
          <p><strong>Detected At:</strong> ${abuseDetection.detectedAt.toISOString()}</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Technical Details</h3>
          <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(abuseDetection.details, null, 2)}
          </pre>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3>Recommended Actions</h3>
          <ul>
            <li>Investigate user activity patterns</li>
            <li>Review recent vote rewards for this user</li>
            <li>Consider temporary restrictions if pattern persists</li>
            <li>Check for related accounts with similar patterns</li>
          </ul>
        </div>

        <p style="margin-top: 30px; color: #6b7280;">
          This is an automated alert from the PromptCraft Vote Abuse Monitoring System.
          <br>
          <a href="${process.env.NEXTAUTH_URL}/admin/moderation/abuse" style="color: #3b82f6;">
            View in Admin Dashboard →
          </a>
        </p>
      </div>
    `;

    // Send to all admin emails
    for (const email of this.ADMIN_EMAILS) {
      if (!email) continue;
      try {
        await this.emailService.sendEmail({
          email,
          subject,
          html: message
        });
      } catch (error) {
        console.error(`Failed to send abuse alert to ${email}:`, error);
      }
    }
  }

  /**
   * Check for coordinated attacks
   */
  private async checkCoordinatedAttacks(abuseDetection: AbuseAlert): Promise<void> {
    const now = new Date();
    const oneHourAgo = subHours(now, 1);

    // Check for multiple users from same IP
    if (abuseDetection.details?.ipAddress) {
      const sameIPAbuse = await prisma.voteAbuseDetection.count({
        where: {
          detectedAt: { gte: oneHourAgo },
          details: {
            path: ['ipAddress'],
            equals: abuseDetection.details.ipAddress
          }
        }
      });

      if (sameIPAbuse >= this.ALERT_THRESHOLDS.COORDINATED_ATTACK) {
        await this.sendCoordinatedAttackAlert(abuseDetection.details.ipAddress, sameIPAbuse);
      }
    }

    // Check for similar abuse patterns across multiple users
    const similarPatterns = await prisma.voteAbuseDetection.count({
      where: {
        abuseType: abuseDetection.type,
        detectedAt: { gte: oneHourAgo },
        severity: { in: [VoteAbuseSeverity.HIGH, VoteAbuseSeverity.CRITICAL] }
      }
    });

    if (similarPatterns >= 5) {
      await this.sendPatternAttackAlert(abuseDetection.type, similarPatterns);
    }
  }

  /**
   * Send coordinated attack alert
   */
  private async sendCoordinatedAttackAlert(ipAddress: string, count: number): Promise<void> {
    const subject = `🚨 Coordinated Vote Abuse Attack Detected`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #dc2626;">Coordinated Attack Alert</h2>
        
        <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p><strong>IP Address:</strong> ${ipAddress}</p>
          <p><strong>Abuse Detections:</strong> ${count} in the last hour</p>
          <p><strong>Detected At:</strong> ${new Date().toISOString()}</p>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3>Immediate Actions Required</h3>
          <ul>
            <li>Consider IP-based rate limiting</li>
            <li>Investigate all accounts from this IP</li>
            <li>Review vote patterns for manipulation</li>
            <li>Consider temporary IP blocking if attack continues</li>
          </ul>
        </div>
      </div>
    `;

    for (const email of this.ADMIN_EMAILS) {
      if (!email) continue;
      try {
        await this.emailService.sendEmail({
          email,
          subject,
          html: message
        });
      } catch (error) {
        console.error(`Failed to send coordinated attack alert to ${email}:`, error);
      }
    }
  }

  /**
   * Send pattern attack alert
   */
  private async sendPatternAttackAlert(abuseType: VoteAbuseType, count: number): Promise<void> {
    const subject = `🚨 Systematic Abuse Pattern Detected - ${abuseType}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #dc2626;">Systematic Abuse Pattern Alert</h2>
        
        <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p><strong>Abuse Type:</strong> ${abuseType}</p>
          <p><strong>High-Severity Detections:</strong> ${count} in the last hour</p>
          <p><strong>Detected At:</strong> ${new Date().toISOString()}</p>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3>Recommended Actions</h3>
          <ul>
            <li>Investigate if this is a coordinated attack</li>
            <li>Review detection rules for false positives</li>
            <li>Consider temporary tightening of abuse thresholds</li>
            <li>Monitor for escalation patterns</li>
          </ul>
        </div>
      </div>
    `;

    for (const email of this.ADMIN_EMAILS) {
      if (!email) continue;
      try {
        await this.emailService.sendEmail({
          email,
          subject,
          html: message
        });
      } catch (error) {
        console.error(`Failed to send pattern attack alert to ${email}:`, error);
      }
    }
  }

  /**
   * Update real-time statistics
   */
  private async updateRealTimeStats(abuseDetection: AbuseAlert): Promise<void> {
    // This could be implemented with Redis for real-time stats
    // For now, we'll use database aggregations
    try {
      // Update abuse pattern tracking
      await prisma.votePattern.upsert({
        where: {
          userId_timeWindow: {
            userId: abuseDetection.userId,
            timeWindow: 'abuse_tracking'
          }
        },
        update: {
          suspiciousPatterns: {
            push: {
              type: abuseDetection.type,
              severity: abuseDetection.severity,
              detectedAt: abuseDetection.detectedAt,
              riskScore: abuseDetection.riskScore
            }
          },
          riskScore: { increment: abuseDetection.riskScore },
          lastUpdated: new Date()
        },
        create: {
          userId: abuseDetection.userId,
          timeWindow: 'abuse_tracking',
          votesCount: 0,
          upvotesCount: 0,
          downvotesCount: 0,
          uniquePromptsVoted: 0,
          uniqueAuthorsVoted: 0,
          creditsEarned: 0,
          suspiciousPatterns: [{
            type: abuseDetection.type,
            severity: abuseDetection.severity,
            detectedAt: abuseDetection.detectedAt,
            riskScore: abuseDetection.riskScore
          }],
          riskScore: abuseDetection.riskScore,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating real-time stats:', error);
    }
  }

  /**
   * Check for system-wide anomalies
   */
  private async checkSystemAnomalies(): Promise<void> {
    const now = new Date();
    const oneHourAgo = subHours(now, 1);

    try {
      // Check vote rate
      const votesLastHour = await prisma.vote.count({
        where: { createdAt: { gte: oneHourAgo } }
      });

      if (votesLastHour > this.ALERT_THRESHOLDS.SYSTEM_OVERLOAD) {
        await this.sendSystemOverloadAlert(votesLastHour);
      }

      // Check abuse detection rate
      const abuseDetectionsLastHour = await prisma.voteAbuseDetection.count({
        where: { detectedAt: { gte: oneHourAgo } }
      });

      const abuseRate = votesLastHour > 0 ? abuseDetectionsLastHour / votesLastHour : 0;

      if (abuseRate > this.ALERT_THRESHOLDS.ABUSE_RATE_SPIKE) {
        await this.sendAbuseRateSpikeAlert(abuseRate, votesLastHour, abuseDetectionsLastHour);
      }

    } catch (error) {
      console.error('Error checking system anomalies:', error);
    }
  }

  /**
   * Send system overload alert
   */
  private async sendSystemOverloadAlert(votesPerHour: number): Promise<void> {
    const subject = `⚠️ System Overload Alert - High Vote Volume`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #f59e0b;">System Overload Alert</h2>
        
        <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p><strong>Votes in Last Hour:</strong> ${votesPerHour}</p>
          <p><strong>Threshold:</strong> ${this.ALERT_THRESHOLDS.SYSTEM_OVERLOAD}</p>
          <p><strong>Detected At:</strong> ${new Date().toISOString()}</p>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3>Recommended Actions</h3>
          <ul>
            <li>Monitor system performance and response times</li>
            <li>Check for potential DDoS or bot attacks</li>
            <li>Consider temporary rate limiting</li>
            <li>Scale infrastructure if needed</li>
          </ul>
        </div>
      </div>
    `;

    for (const email of this.ADMIN_EMAILS) {
      if (!email) continue;
      try {
        await this.emailService.sendEmail({
          email,
          subject,
          html: message
        });
      } catch (error) {
        console.error(`Failed to send system overload alert to ${email}:`, error);
      }
    }
  }

  /**
   * Send abuse rate spike alert
   */
  private async sendAbuseRateSpikeAlert(
    abuseRate: number, 
    totalVotes: number, 
    abuseDetections: number
  ): Promise<void> {
    const subject = `🚨 Abuse Detection Rate Spike Alert`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #dc2626;">Abuse Rate Spike Alert</h2>
        
        <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p><strong>Abuse Rate:</strong> ${(abuseRate * 100).toFixed(2)}%</p>
          <p><strong>Total Votes:</strong> ${totalVotes}</p>
          <p><strong>Abuse Detections:</strong> ${abuseDetections}</p>
          <p><strong>Threshold:</strong> ${(this.ALERT_THRESHOLDS.ABUSE_RATE_SPIKE * 100).toFixed(1)}%</p>
          <p><strong>Detected At:</strong> ${new Date().toISOString()}</p>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3>Immediate Actions Required</h3>
          <ul>
            <li>Investigate for coordinated abuse campaigns</li>
            <li>Review recent changes to abuse detection rules</li>
            <li>Consider tightening vote validation</li>
            <li>Monitor for false positive spikes</li>
          </ul>
        </div>
      </div>
    `;

    for (const email of this.ADMIN_EMAILS) {
      if (!email) continue;
      try {
        await this.emailService.sendEmail({
          email,
          subject,
          html: message
        });
      } catch (error) {
        console.error(`Failed to send abuse rate spike alert to ${email}:`, error);
      }
    }
  }

  /**
   * Generate comprehensive abuse statistics
   */
  public async getAbuseStatistics(days: number = 30): Promise<AbuseStats> {
    const now = new Date();
    const startDate = subDays(now, days);

    const [
      totalDetections,
      detectionsByType,
      detectionsBySeverity,
      detectionsByStatus,
      last24h,
      last7d,
      topOffenders
    ] = await Promise.all([
      // Total detections in period
      prisma.voteAbuseDetection.count({
        where: { detectedAt: { gte: startDate } }
      }),

      // Group by type
      prisma.voteAbuseDetection.groupBy({
        by: ['abuseType'],
        where: { detectedAt: { gte: startDate } },
        _count: true
      }),

      // Group by severity
      prisma.voteAbuseDetection.groupBy({
        by: ['severity'],
        where: { detectedAt: { gte: startDate } },
        _count: true
      }),

      // Group by status
      prisma.voteAbuseDetection.groupBy({
        by: ['status'],
        where: { detectedAt: { gte: startDate } },
        _count: true
      }),

      // Last 24 hours
      prisma.voteAbuseDetection.count({
        where: { detectedAt: { gte: subDays(now, 1) } }
      }),

      // Last 7 days
      prisma.voteAbuseDetection.count({
        where: { detectedAt: { gte: subDays(now, 7) } }
      }),

      // Top offenders
      prisma.voteAbuseDetection.groupBy({
        by: ['userId'],
        where: { detectedAt: { gte: startDate } },
        _count: true,
        _max: { severity: true, detectedAt: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      })
    ]);

    // Convert grouped results to record format
    const byType = Object.values(VoteAbuseType).reduce((acc, type) => {
      acc[type] = detectionsByType.find(d => d.abuseType === type)?._count || 0;
      return acc;
    }, {} as Record<VoteAbuseType, number>);

    const bySeverity = Object.values(VoteAbuseSeverity).reduce((acc, severity) => {
      acc[severity] = detectionsBySeverity.find(d => d.severity === severity)?._count || 0;
      return acc;
    }, {} as Record<VoteAbuseSeverity, number>);

    const byStatus = Object.values(VoteAbuseStatus).reduce((acc, status) => {
      acc[status] = detectionsByStatus.find(d => d.status === status)?._count || 0;
      return acc;
    }, {} as Record<VoteAbuseStatus, number>);

    // Get user details for top offenders
    const topOffendersWithDetails = await Promise.all(
      topOffenders.map(async (offender) => {
        const user = await prisma.user.findUnique({
          where: { id: offender.userId },
          select: { name: true, email: true }
        });

        return {
          userId: offender.userId,
          userName: user?.name ?? undefined,
          userEmail: user?.email,
          detectionCount: offender._count,
          highestSeverity: offender._max.severity!,
          latestDetection: offender._max.detectedAt!
        };
      })
    );

    return {
      totalDetections,
      byType,
      bySeverity,
      byStatus,
      recentTrends: {
        last24h,
        last7d,
        last30d: totalDetections
      },
      topOffenders: topOffendersWithDetails
    };
  }

  /**
   * Get system health metrics
   */
  public async getSystemHealth(): Promise<SystemHealth> {
    const now = new Date();
    const oneHourAgo = subHours(now, 1);
    const oneDayAgo = subDays(now, 1);

    const [
      activeAbuseCases,
      pendingInvestigations,
      resolvedCases,
      totalCases,
      votesPerHour,
      rewardsPerHour,
      abuseDetectionsPerHour,
      avgResolutionTime
    ] = await Promise.all([
      // Active abuse cases
      prisma.voteAbuseDetection.count({
        where: { 
          status: { in: [VoteAbuseStatus.PENDING, VoteAbuseStatus.INVESTIGATING] }
        }
      }),

      // Pending investigations
      prisma.voteAbuseDetection.count({
        where: { status: VoteAbuseStatus.INVESTIGATING }
      }),

      // Resolved cases (for false positive rate)
      prisma.voteAbuseDetection.count({
        where: { 
          status: VoteAbuseStatus.FALSE_POSITIVE,
          detectedAt: { gte: subDays(now, 30) }
        }
      }),

      // Total cases in last 30 days
      prisma.voteAbuseDetection.count({
        where: { detectedAt: { gte: subDays(now, 30) } }
      }),

      // Votes per hour
      prisma.vote.count({
        where: { createdAt: { gte: oneHourAgo } }
      }),

      // Rewards per hour
      prisma.voteReward.count({
        where: { createdAt: { gte: oneHourAgo } }
      }),

      // Abuse detections per hour
      prisma.voteAbuseDetection.count({
        where: { detectedAt: { gte: oneHourAgo } }
      }),

      // Average resolution time
      prisma.voteAbuseDetection.findMany({
        where: {
          status: { in: [VoteAbuseStatus.RESOLVED, VoteAbuseStatus.FALSE_POSITIVE] },
          resolvedAt: { not: null },
          detectedAt: { gte: subDays(now, 30) }
        },
        select: { detectedAt: true, resolvedAt: true }
      })
    ]);

    // Calculate average resolution time in hours
    const resolutionTimes = avgResolutionTime
      .filter(case_ => case_.resolvedAt)
      .map(case_ => (case_.resolvedAt!.getTime() - case_.detectedAt.getTime()) / (1000 * 60 * 60));
    
    const averageResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
      : 0;

    const falsePositiveRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;
    const abuseDetectionRate = votesPerHour > 0 ? (abuseDetectionsPerHour / votesPerHour) * 100 : 0;

    return {
      activeAbuseCases,
      pendingInvestigations,
      falsePositiveRate,
      averageResolutionTime,
      systemLoad: {
        votesPerHour,
        rewardsPerHour,
        abuseDetectionRate
      }
    };
  }

  /**
   * Send daily summary report
   */
  public async sendDailySummaryReport(): Promise<void> {
    try {
      const [stats, health] = await Promise.all([
        this.getAbuseStatistics(1), // Last 24 hours
        this.getSystemHealth()
      ]);

      const subject = `📊 Daily Vote Abuse Monitoring Report - ${new Date().toLocaleDateString()}`;
      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 800px;">
          <h1 style="color: #1f2937;">Daily Vote Abuse Monitoring Report</h1>
          <p style="color: #6b7280;">Report generated on ${new Date().toLocaleString()}</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">Abuse Detections (24h)</h3>
              <p style="font-size: 24px; font-weight: bold; color: ${stats.totalDetections > 10 ? '#dc2626' : '#059669'}; margin: 10px 0;">
                ${stats.totalDetections}
              </p>
              <p style="color: #6b7280; margin: 0;">
                High: ${stats.bySeverity.HIGH} | Medium: ${stats.bySeverity.MEDIUM} | Low: ${stats.bySeverity.LOW}
              </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">System Health</h3>
              <p style="margin: 5px 0;">Active Cases: <strong>${health.activeAbuseCases}</strong></p>
              <p style="margin: 5px 0;">Pending: <strong>${health.pendingInvestigations}</strong></p>
              <p style="margin: 5px 0;">False Positive Rate: <strong>${health.falsePositiveRate.toFixed(1)}%</strong></p>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">System Load (Last Hour)</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 5px 0;"><strong>Votes:</strong> ${health.systemLoad.votesPerHour}</p>
              </div>
              <div>
                <p style="margin: 5px 0;"><strong>Rewards:</strong> ${health.systemLoad.rewardsPerHour}</p>
              </div>
              <div>
                <p style="margin: 5px 0;"><strong>Abuse Rate:</strong> ${health.systemLoad.abuseDetectionRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          ${stats.topOffenders.length > 0 ? `
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Top Offenders (24h)</h3>
            ${stats.topOffenders.slice(0, 5).map(offender => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <p style="margin: 0;"><strong>${offender.userName || 'Unknown User'}</strong> (${offender.userId})</p>
                <p style="margin: 0; color: #6b7280;">Detections: ${offender.detectionCount} | Severity: ${offender.highestSeverity}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3>Actions Required</h3>
            ${health.activeAbuseCases > 0 ? '<p>• Review and investigate active abuse cases</p>' : ''}
            ${health.falsePositiveRate > 20 ? '<p>• High false positive rate - review detection rules</p>' : ''}
            ${health.systemLoad.abuseDetectionRate > 5 ? '<p>• High abuse detection rate - investigate for attacks</p>' : ''}
            ${health.activeAbuseCases === 0 && health.falsePositiveRate <= 20 && health.systemLoad.abuseDetectionRate <= 5 ? '<p>• No immediate actions required - system operating normally</p>' : ''}
          </div>

          <p style="margin-top: 30px; color: #6b7280;">
            <a href="${process.env.NEXTAUTH_URL}/admin/moderation/abuse" style="color: #3b82f6;">
              View Full Report in Admin Dashboard →
            </a>
          </p>
        </div>
      `;

      for (const email of this.ADMIN_EMAILS) {
        if (!email) continue;
        try {
          await this.emailService.sendEmail({
            email,
            subject,
            html: message
          });
        } catch (error) {
          console.error(`Failed to send daily report to ${email}:`, error);
        }
      }

    } catch (error) {
      console.error('Error sending daily summary report:', error);
    }
  }
} 