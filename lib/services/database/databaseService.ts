import { PrismaClient, Prisma, SubscriptionStatus } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';
import { User, Plan, Subscription } from '@prisma/client';

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

  // User operations
  public async getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  public async updateUser(userId: string, data: Partial<User>) {
    const jsonFields = ['emailPreferences', 'notificationSettings', 'themeSettings', 'securitySettings', 'languagePreferences'];
    const processedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (jsonFields.includes(key) && value !== undefined) {
        acc[key] = { set: value };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return prisma.user.update({
      where: { id: userId },
      data: processedData,
    });
  }

  // Plan operations
  public async getPlanByName(name: string) {
    return prisma.plan.findFirst({
      where: { name },
    });
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

  // Subscription operations
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

  public async createSubscription(data: {
    user: { connect: { id: string } };
    plan: { connect: { id: string } };
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  }) {
    return prisma.subscription.create({
      data: {
        ...data,
        status: data.status as SubscriptionStatus,
      },
      include: {
        plan: true,
      },
    });
  }

  public async updateSubscription(userId: string, data: Partial<Subscription>) {
    return prisma.subscription.update({
      where: { userId },
      data,
      include: {
        plan: true,
      },
    });
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
