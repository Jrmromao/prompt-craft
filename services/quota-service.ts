import { prisma } from '@/lib/prisma';
import { AuditLogger } from './audit-logger';
import { Redis } from '@upstash/redis';

export interface QuotaResult {
  isAllowed: boolean;
  remaining: number;
  limit: number;
  resetAt?: Date;
}

export class QuotaService {
  private static instance: QuotaService;
  private redis: Redis;
  private auditLogger: AuditLogger;

  private constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    this.auditLogger = AuditLogger.getInstance();
  }

  public static getInstance(): QuotaService {
    if (!QuotaService.instance) {
      QuotaService.instance = new QuotaService();
    }
    return QuotaService.instance;
  }

  public async checkQuota(
    userId: string,
    quotaType: 'API_CALLS' | 'PROMPT_GENERATIONS' | 'STORAGE'
  ): Promise<QuotaResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, credits: true, creditCap: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const limits = this.getQuotaLimits(user.planType, quotaType);
      const key = `quota:${userId}:${quotaType}`;
      const currentUsage = (await this.redis.get<number>(key)) || 0;

      const isAllowed = currentUsage < limits.limit;
      const remaining = Math.max(0, limits.limit - currentUsage);

      // Log quota check
      await this.auditLogger.logUserAction(
        userId,
        'DATA_ACCESS',
        'QUOTA_CHECK',
        {
          quotaType,
          currentUsage,
          limit: limits.limit,
          remaining,
          isAllowed,
        },
        isAllowed ? 'SUCCESS' : 'QUOTA_EXCEEDED'
      );

      return {
        isAllowed,
        remaining,
        limit: limits.limit,
        resetAt: limits.resetAt,
      };
    } catch (error) {
      console.error('Quota check failed:', error);
      // In case of error, allow the action but log the error
      await this.auditLogger.logSecurityEvent(
        'SECURITY_EVENT',
        'QUOTA_CHECK',
        {
          userId,
          quotaType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'ERROR'
      );
      return { isAllowed: true, remaining: 0, limit: 0 };
    }
  }

  public async incrementUsage(
    userId: string,
    quotaType: 'API_CALLS' | 'PROMPT_GENERATIONS' | 'STORAGE',
    amount: number = 1
  ): Promise<void> {
    const key = `quota:${userId}:${quotaType}`;
    await this.redis.incrby(key, amount);

    // Set expiration if not already set (24 hours)
    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      await this.redis.expire(key, 24 * 60 * 60);
    }
  }

  private getQuotaLimits(
    planType: 'FREE' | 'LITE' | 'PRO',
    quotaType: 'API_CALLS' | 'PROMPT_GENERATIONS' | 'STORAGE'
  ): { limit: number; resetAt: Date } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const limits = {
      FREE: {
        API_CALLS: 100,
        PROMPT_GENERATIONS: 50,
        STORAGE: 100 * 1024 * 1024, // 100MB
      },
      LITE: {
        API_CALLS: 1000,
        PROMPT_GENERATIONS: 500,
        STORAGE: 1024 * 1024 * 1024, // 1GB
      },
      PRO: {
        API_CALLS: 10000,
        PROMPT_GENERATIONS: 5000,
        STORAGE: 10 * 1024 * 1024 * 1024, // 10GB
      },
    };

    return {
      limit: limits[planType][quotaType],
      resetAt: tomorrow,
    };
  }
}
