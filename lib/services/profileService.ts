import { prisma } from '@/lib/prisma';
import type { User, Prisma } from '@prisma/client';
import { subDays, format } from 'date-fns';
import { userUpdateSchema } from '@/lib/validations/user';
import { ServiceError } from './types';
import { AuditService } from './auditService';
import { AuditAction } from '@/app/constants/audit';
import { Redis } from '@upstash/redis';

export type UsageStats = {
  totalCreditsUsed: number;
  creditsRemaining: number;
  creditCap: number;
  lastCreditReset: Date;
  totalRequests: number;
  dailyUsage: { date: string; used: number }[];
  recentActivity: { date: string; description: string | null; amount: number; type: string }[];
};

export class ProfileService {
  private static instance: ProfileService;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private redis: Redis;

  private constructor() {
    this.redis = Redis.fromEnv();
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Gets the Redis cache key for a user
   */
  private getUserCacheKey(clerkId: string): string {
    return `user:profile:${clerkId}`;
  }

  /**
   * Fetches a user profile by Clerk ID.
   * @param clerkId Clerk user ID
   * @returns User object or null if not found
   */
  public async getProfileByClerkId(clerkId: string): Promise<User | null> {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    try {
      // Check Redis cache first
      const cacheKey = this.getUserCacheKey(clerkId);
      const cachedUser = await this.redis.get<User>(cacheKey);

      if (cachedUser) {
        return cachedUser;
      }

      const user = await prisma.user.findUnique({
        where: {  clerkId: clerkId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          planType: true,
          monthlyCredits: true,
          purchasedCredits: true,
          creditCap: true,
          lastCreditReset: true,
          imageUrl: true,
          bio: true,
          jobTitle: true,
          location: true,
          company: true,
          website: true,
          twitter: true,
          linkedin: true,
          lastActiveAt: true,
          createdAt: true,
          updatedAt: true,
          clerkId: true,
          stripeCustomerId: true,
          password: true,
          emailPreferences: true,
          languagePreferences: true,
          notificationSettings: true,
          securitySettings: true,
          themeSettings: true,
          status: true,
          dataRetentionPeriod: true,
          lastDataAccess: true,
          dataDeletionRequest: true,
          dataRetentionPolicy: true,
          dataProcessingConsent: true
        },
      });

      if (user) {
        // Cache the user in Redis
        await this.redis.set(cacheKey, user, { ex: this.CACHE_TTL });
      }
      return user;
    } catch (error) {
      console.error(`Error fetching profile for user ${clerkId}:`, error);
      throw new ServiceError('Failed to fetch user profile', 'DATABASE_ERROR');
    }
  }

  /**
   * Fetches usage stats and daily usage for the user by Clerk ID.
   */
  public async getUsageStatsByClerkId(clerkId: string): Promise<UsageStats | null> {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) return null;

    const since = user.lastCreditReset || subDays(new Date(), 30);
    const now = new Date();

    const creditHistory = await prisma.creditHistory.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: since, lte: now },
      },
      orderBy: { createdAt: 'asc' },
    });

    const days = 30;
    const dailyUsage: { date: string; used: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const used = creditHistory
        .filter(h => format(h.createdAt, 'yyyy-MM-dd') === dayStr)
        .reduce((sum, h) => sum + Math.abs(h.amount), 0);
      dailyUsage.push({ date: dayStr, used });
    }

    const totalCreditsUsed = creditHistory.reduce((sum, h) => sum + Math.abs(h.amount), 0);
    const creditsRemaining = (user.monthlyCredits + user.purchasedCredits);
    const totalRequests = creditHistory.length;

    const recent = await prisma.creditHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const recentActivity = recent.map(h => ({
      date: h.createdAt.toISOString(),
      description: h.description,
      amount: h.amount,
      type: h.type,
    }));

    return {
      totalCreditsUsed,
      creditsRemaining,
      creditCap: user.creditCap,
      lastCreditReset: user.lastCreditReset || new Date(),
      totalRequests,
      dailyUsage,
      recentActivity,
    };
  }

  /**
   * Invalidates the cache for a specific user
   */
  private async invalidateCache(clerkId: string): Promise<void> {
    try {
      const cacheKey = this.getUserCacheKey(clerkId);
      await this.redis.del(cacheKey);
    } catch (error) {
      console.error(`Error invalidating cache for user ${clerkId}:`, error);
    }
  }

  /**
   * Updates a user's profile information
   */
  public async updateProfile(clerkId: string, data: Partial<User>): Promise<User> {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    try {
      const validatedData = userUpdateSchema.parse(data);
      const updateData: Prisma.UserUpdateInput = {
        ...validatedData,
      };

      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: updateData,
      });

      // Invalidate cache
      await this.invalidateCache(clerkId);

      // Log the profile update
      await AuditService.getInstance().logAudit({
        userId: updatedUser.id,
        action: AuditAction.USER_UPDATE_PROFILE,
        resource: 'profile',
        details: { updatedFields: Object.keys(validatedData) },
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error updating profile for user ${clerkId}:`, error);
      throw new ServiceError('Failed to update user profile', 'DATABASE_ERROR');
    }
  }
} 