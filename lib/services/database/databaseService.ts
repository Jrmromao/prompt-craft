import { PrismaClient, Prisma } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';

// Cache configuration
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
} as const;

export class DatabaseService {
  private static instance: DatabaseService;
  private redis: Redis;

  private constructor() {
    this.redis = Redis.fromEnv();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Cache methods
  private async getCached<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get<T>(key);
    return cached;
  }

  private async setCache<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redis.set(key, value, { ex: ttl });
  }

  // Optimized query methods with caching
  public async getSubscriptionWithCache(userId: string) {
    const cacheKey = `subscription:${userId}`;

    // Try to get from cache
    const cached = await this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    });

    // Cache the result
    if (subscription) {
      await this.setCache(cacheKey, subscription, CACHE_TTL.MEDIUM);
    }

    return subscription;
  }

  public async getPlanWithCache(planId: string) {
    const cacheKey = `plan:${planId}`;

    // Try to get from cache
    const cached = await this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    // Cache the result
    if (plan) {
      await this.setCache(cacheKey, plan, CACHE_TTL.LONG);
    }

    return plan;
  }

  // Transaction methods
  public async withTransaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async tx => {
      try {
        return await operations(tx);
      } catch (error) {
        // Log transaction error
        console.error('Transaction failed:', error);
        throw error;
      }
    });
  }

  // Optimized subscription update with transaction and cache invalidation
  public async updateSubscription(subscriptionId: string, data: Prisma.SubscriptionUpdateInput) {
    return await this.withTransaction(async tx => {
      const subscription = await tx.subscription.update({
        where: { id: subscriptionId },
        data,
        include: {
          plan: true,
        },
      });

      // Invalidate cache
      await this.redis.del(`subscription:${subscription.userId}`);

      return subscription;
    });
  }

  // Optimized subscription creation with transaction
  public async createSubscription(data: Prisma.SubscriptionCreateInput) {
    return await this.withTransaction(async tx => {
      const subscription = await tx.subscription.create({
        data,
        include: {
          plan: true,
        },
      });

      // Cache the new subscription
      await this.setCache(`subscription:${subscription.userId}`, subscription, CACHE_TTL.MEDIUM);

      return subscription;
    });
  }

  // Batch operations
  public async batchUpdateSubscriptions(
    updates: Array<{
      id: string;
      data: Prisma.SubscriptionUpdateInput;
    }>
  ) {
    return await this.withTransaction(async tx => {
      const results = await Promise.all(
        updates.map(({ id, data }) =>
          tx.subscription.update({
            where: { id },
            data,
            include: {
              plan: true,
            },
          })
        )
      );

      // Invalidate caches
      await Promise.all(results.map(sub => this.redis.del(`subscription:${sub.userId}`)));

      return results;
    });
  }
}
