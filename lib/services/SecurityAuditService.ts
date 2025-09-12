import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';
import { AuditAction } from '@/app/constants/audit';

interface SecurityEvent {
  type: AuditAction.FAILED_LOGIN | AuditAction.SUSPICIOUS_ACTIVITY | AuditAction.RATE_LIMIT_EXCEEDED | AuditAction.UNAUTHORIZED_ACCESS;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SecurityAuditService {
  private static instance: SecurityAuditService;

  private constructor() {}

  public static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: event.userId,
          action: event.type,
          resource: 'security',
          details: JSON.stringify({
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            severity: event.severity,
            ...event.details,
          }),
          timestamp: new Date(),
        },
      });

      // Alert on critical events
      if (event.severity === 'CRITICAL') {
        await this.sendSecurityAlert(event);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async detectSuspiciousActivity(userId: string, ipAddress: string): Promise<boolean> {
    try {
      const recentEvents = await prisma.auditLog.findMany({
        where: {
          userId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      // Check for suspicious patterns
      const failedLogins = recentEvents.filter(e => e.action === 'FAILED_LOGIN').length;
      const differentIPs = new Set(
        recentEvents.map(e => {
          try {
            if (typeof e.details === 'string') {
              return JSON.parse(e.details).ipAddress;
            } else if (e.details && typeof e.details === 'object') {
              return (e.details as any).ipAddress;
            }
            return null;
          } catch {
            return null;
          }
        }).filter(Boolean)
      ).size;

      // Suspicious if more than 5 failed logins or access from 5+ different IPs
      return failedLogins > 5 || differentIPs > 5;
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      return false;
    }
  }

  async getSecurityMetrics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<{
    totalEvents: number;
    criticalEvents: number;
    failedLogins: number;
    suspiciousUsers: string[];
  }> {
    try {
      const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const events = await prisma.auditLog.findMany({
        where: {
          timestamp: { gte: since },
          action: {
            in: ['FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS'],
          },
        },
      });

      const criticalEvents = events.filter(e => {
        try {
          if (typeof e.details === 'string') {
            return JSON.parse(e.details).severity === 'CRITICAL';
          } else if (e.details && typeof e.details === 'object') {
            return (e.details as any).severity === 'CRITICAL';
          }
          return false;
        } catch {
          return false;
        }
      }).length;

      const failedLogins = events.filter(e => e.action === 'FAILED_LOGIN').length;

      const suspiciousUsers = Array.from(
        new Set(
          events
            .filter(e => e.userId)
            .map(e => e.userId!)
        )
      );

      return {
        totalEvents: events.length,
        criticalEvents,
        failedLogins,
        suspiciousUsers,
      };
    } catch (error) {
      throw new ServiceError('Failed to get security metrics', 'SECURITY_METRICS_FAILED', 500);
    }
  }

  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // In a real implementation, this would send alerts via email, Slack, etc.
    console.error('CRITICAL SECURITY EVENT:', {
      type: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
    });
  }
}
