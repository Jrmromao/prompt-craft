import { prisma } from '@/lib/prisma';
import { AuditService } from './auditService';
import { Redis } from '@upstash/redis';
import { AuditAction } from '@/app/constants/audit';

export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  total: number;
  resetAt: Date;
}

export class QuotaService {
  private static instance: QuotaService;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
  }

  public static getInstance(): QuotaService {
    if (!QuotaService.instance) {
      QuotaService.instance = new QuotaService();
    }
    return QuotaService.instance;
  }

  public async checkQuota(userId: string, action: string): Promise<QuotaResult> {
    const auditService = AuditService.getInstance();
    const key = `quota:${userId}:${action}`;
    const now = new Date();
    const window = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    try {
      const quota = await this.redis.get<{ count: number; resetAt: number }>(key);
      const total = await this.getQuotaLimit(userId, action);

      if (!quota) {
        // First time usage
        const resetAt = new Date(now.getTime() + window);
        await this.redis.set(key, { count: 1, resetAt: resetAt.getTime() });
        await auditService.logAudit({
          userId,
          action: AuditAction.QUOTA_CHECK,
          resource: action,
          status: 'success',
          details: {
          allowed: true,
          remaining: total - 1,
          total,
          resetAt,
          },
        });
        return { allowed: true, remaining: total - 1, total, resetAt };
      }

      if (now.getTime() > quota.resetAt) {
        // Reset window
        const resetAt = new Date(now.getTime() + window);
        await this.redis.set(key, { count: 1, resetAt: resetAt.getTime() });
        await auditService.logAudit({
          userId,
          action: AuditAction.QUOTA_CHECK,
          resource: action,
          status: 'success',
          details: {
          allowed: true,
          remaining: total - 1,
          total,
          resetAt,
          },
        });
        return { allowed: true, remaining: total - 1, total, resetAt };
      }

      if (quota.count >= total) {
        // Quota exceeded
        await auditService.logAudit({
          userId,
          action: AuditAction.QUOTA_CHECK,
          resource: action,
          status: 'success',
          details: {
          allowed: false,
          remaining: 0,
          total,
          resetAt: new Date(quota.resetAt),
          },
        });
        return {
          allowed: false,
          remaining: 0,
          total,
          resetAt: new Date(quota.resetAt),
        };
      }

      // Increment usage
      await this.redis.set(key, {
        count: quota.count + 1,
        resetAt: quota.resetAt,
      });

      await auditService.logAudit({
        userId,
        action: AuditAction.QUOTA_CHECK,
        resource: action,
        status: 'success',
        details: {
        allowed: true,
        remaining: total - (quota.count + 1),
        total,
        resetAt: new Date(quota.resetAt),
        },
      });

      return {
        allowed: true,
        remaining: total - (quota.count + 1),
        total,
        resetAt: new Date(quota.resetAt),
      };
    } catch (error) {
      console.error('Error checking quota:', error);
      // In case of error, allow the action but log it
      await auditService.logAudit({
        userId,
        action: AuditAction.QUOTA_CHECK,
        resource: action,
        status: 'failure',
        details: {
          error: 'Failed to check quota',
          allowed: true,
        },
      });
      return { allowed: true, remaining: 0, total: 0, resetAt: now };
    }
  }

  private async getQuotaLimit(userId: string, action: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    const quotaLimits: Record<string, Record<string, number>> = {
      FREE: {
        'prompt.create': 5,
        'prompt.edit': 10,
        'prompt.delete': 5,
        'prompt.copy': 10,
      },
      LITE: {
        'prompt.create': 20,
        'prompt.edit': 50,
        'prompt.delete': 20,
        'prompt.copy': 50,
      },
      PRO: {
        'prompt.create': 100,
        'prompt.edit': 200,
        'prompt.delete': 100,
        'prompt.copy': 200,
      },
    };

    return quotaLimits[user?.planType || 'FREE'][action] || 0;
  }
}
