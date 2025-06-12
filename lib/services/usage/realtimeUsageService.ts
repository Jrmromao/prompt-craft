import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';
import { Usage, Subscription } from '@prisma/client';

export class RealtimeUsageService {
  private static instance: RealtimeUsageService;
  private redis: Redis;
  private readonly CACHE_TTL = 60; // 1 minute cache TTL

  private constructor() {
    this.redis = Redis.fromEnv();
  }

  public static getInstance(): RealtimeUsageService {
    if (!RealtimeUsageService.instance) {
      RealtimeUsageService.instance = new RealtimeUsageService();
    }
    return RealtimeUsageService.instance;
  }

  /**
   * Track real-time usage for a feature
   */
  public async trackRealtimeUsage(
    userId: string,
    feature: string,
    count: number = 1
  ): Promise<void> {
    const key = this.getUsageKey(userId, feature);
    
    // Increment usage in Redis
    await this.redis.incrby(key, count);
    
    // Set expiry if this is the first increment
    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      await this.redis.expire(key, this.CACHE_TTL);
    }

    // Get current usage
    const currentUsage = await this.getRealtimeUsage(userId, feature);
    
    // Check if we need to sync with database
    if (currentUsage % 10 === 0) { // Sync every 10 units
      await this.syncWithDatabase(userId, feature, currentUsage);
    }

    // Check if we need to send notifications
    await this.checkAndNotifyUsage(userId, feature, currentUsage);
  }

  /**
   * Get real-time usage for a feature
   */
  public async getRealtimeUsage(
    userId: string,
    feature: string
  ): Promise<number> {
    const key = this.getUsageKey(userId, feature);
    const cachedUsage = await this.redis.get<number>(key);
    
    if (cachedUsage === null) {
      // If not in cache, get from database and cache it
      const dbUsage = await this.getDatabaseUsage(userId, feature);
      await this.redis.set(key, dbUsage, { ex: this.CACHE_TTL });
      return dbUsage;
    }

    return cachedUsage;
  }

  /**
   * Get real-time usage for all features
   */
  public async getAllRealtimeUsage(userId: string): Promise<Record<string, number>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user?.subscription?.plan) {
      throw new Error('No active subscription found');
    }

    const features = JSON.parse(user.subscription.plan.features as string) as string[];
    const usage: Record<string, number> = {};

    await Promise.all(
      features.map(async (feature) => {
        usage[feature] = await this.getRealtimeUsage(userId, feature);
      })
    );

    return usage;
  }

  /**
   * Sync Redis usage with database
   */
  private async syncWithDatabase(
    userId: string,
    feature: string,
    usage: number
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user?.subscription) {
      throw new Error('No active subscription found');
    }

    const { currentPeriodStart, currentPeriodEnd } = user.subscription;

    // Get current database usage
    const dbUsage = await this.getDatabaseUsage(userId, feature);

    // If Redis usage is higher, create new usage record
    if (usage > dbUsage) {
      await prisma.usage.create({
        data: {
          userId,
          feature,
          count: usage - dbUsage,
        },
      });
    }
  }

  /**
   * Get usage from database
   */
  private async getDatabaseUsage(
    userId: string,
    feature: string
  ): Promise<number> {
    const result = await prisma.usage.aggregate({
      where: {
        userId,
        feature,
      },
      _sum: {
        count: true,
      },
    });

    return result._sum.count || 0;
  }

  /**
   * Check if we need to send usage notifications
   */
  private async checkAndNotifyUsage(
    userId: string,
    feature: string,
    currentUsage: number
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user?.subscription?.plan) {
      return;
    }

    const planFeatures = JSON.parse(user.subscription.plan.features as string) as Record<string, number>;
    const limit = planFeatures[`max${feature.charAt(0).toUpperCase() + feature.slice(1)}`] || 0;

    // Check if we're approaching the limit (80%, 90%, 95%)
    const thresholds = [0.8, 0.9, 0.95];
    const usagePercentage = currentUsage / limit;

    for (const threshold of thresholds) {
      if (usagePercentage >= threshold && usagePercentage < threshold + 0.01) {
        await this.sendUsageNotification(userId, feature, threshold * 100);
      }
    }
  }

  /**
   * Send usage notification
   */
  private async sendUsageNotification(
    userId: string,
    feature: string,
    percentage: number
  ): Promise<void> {
    // Create notification in database
    await prisma.notification.create({
      data: {
        userId,
        type: 'USAGE_ALERT',
        title: 'Usage Limit Alert',
        message: `You have used ${percentage}% of your ${feature} limit.`,
        metadata: {
          feature,
          percentage,
        },
      },
    });

    // TODO: Implement real-time notification delivery (e.g., WebSocket, push notification)
  }

  /**
   * Get Redis key for usage tracking
   */
  private getUsageKey(userId: string, feature: string): string {
    return `usage:${userId}:${feature}`;
  }
} 