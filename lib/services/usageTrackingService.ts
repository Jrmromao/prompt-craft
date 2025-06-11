import { prisma } from '@/lib/prisma';
import { Plan } from '@prisma/client';

interface UsageMetrics {
  promptCount: number;
  tokenUsage: number;
  teamMemberCount: number;
  lastUsedAt: Date;
  usageByDay: { date: string; count: number }[];
  usageByFeature: { feature: string; count: number }[];
  status: string;
  message: string;
}

interface UsageLimits {
  maxPrompts: number;
  maxTokens: number;
  maxTeamMembers: number;
  features: string[];
}

export class UsageTrackingService {
  private static instance: UsageTrackingService;
  private cache: Map<string, { metrics: UsageMetrics; timestamp: number }>;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): UsageTrackingService {
    if (!UsageTrackingService.instance) {
      UsageTrackingService.instance = new UsageTrackingService();
    }
    return UsageTrackingService.instance;
  }

  public async trackPromptUsage(promptId: string, userId: string, tokenCount: number): Promise<void> {
    await prisma.$transaction(async tx => {
      // Create usage record
      await tx.promptUsage.create({
        data: {
          promptId,
          userId,
          tokenCount,
          createdAt: new Date()
        }
      });

      // Update prompt usage count
      await tx.prompt.update({
        where: { id: promptId },
        data: {
          usageCount: {
            increment: 1,
          },
          lastUsedAt: new Date(),
        },
      });
    });
    this.invalidateCache(userId);
  }

  public async trackFeatureUsage(userId: string, feature: string): Promise<void> {
    await prisma.featureUsage.create({
      data: {
        userId,
        feature,
        createdAt: new Date()
      }
    });
    this.invalidateCache(userId);
  }

  public async getUserMetrics(userId: string): Promise<UsageMetrics> {
    const cached = this.getCachedMetrics(userId);
    if (cached) {
      return cached;
    }

    try {
      // First check if user exists to provide better error messages
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });

      if (!user) {
        console.warn(`User metrics requested for non-existent user: ${userId}`);
        return this.getDefaultMetrics('User not found');
      }

      const [promptCount, tokenUsage, teamMemberCount, lastUsedAt, usageByDay, usageByFeature] = await Promise.all([
        prisma.prompt.count({ where: { userId } }).catch(error => {
          console.warn(`Failed to fetch prompt count for user ${userId}:`, error);
          return 0;
        }),
        prisma.promptUsage.aggregate({
          where: { userId },
          _sum: { tokenCount: true }
        }).catch(error => {
          console.warn(`Failed to fetch token usage for user ${userId}:`, error);
          return { _sum: { tokenCount: 0 } };
        }),
        prisma.teamMember.count({ where: { userId } }).catch(error => {
          console.warn(`Failed to fetch team member count for user ${userId}:`, error);
          return 0;
        }),
        prisma.promptUsage.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        }).catch(error => {
          console.warn(`Failed to fetch last usage for user ${userId}:`, error);
          return null;
        }),
        this.getUsageByDay(userId).catch(error => {
          console.warn(`Failed to fetch daily usage for user ${userId}:`, error);
          return [];
        }),
        this.getUsageByFeature(userId).catch(error => {
          console.warn(`Failed to fetch feature usage for user ${userId}:`, error);
          return [];
        })
      ]);

      const metrics: UsageMetrics = {
        promptCount: promptCount || 0,
        tokenUsage: tokenUsage?._sum?.tokenCount || 0,
        teamMemberCount: teamMemberCount || 0,
        lastUsedAt: lastUsedAt?.createdAt || new Date(),
        usageByDay: usageByDay || [],
        usageByFeature: usageByFeature || [],
        status: 'success',
        message: 'Usage metrics retrieved successfully'
      };

      this.setCachedMetrics(userId, metrics);
      return metrics;
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return this.getDefaultMetrics('Unable to retrieve usage metrics');
    }
  }

  private getDefaultMetrics(message: string): UsageMetrics {
    return {
      promptCount: 0,
      tokenUsage: 0,
      teamMemberCount: 0,
      lastUsedAt: new Date(),
      usageByDay: [],
      usageByFeature: [],
      status: 'error',
      message
    };
  }

  public async getUserLimits(userId: string): Promise<UsageLimits> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user?.subscription?.plan) {
      const freePlan = await prisma.plan.findUnique({
        where: { name: 'FREE' }
      });
      return this.formatPlanLimits(freePlan!);
    }

    return this.formatPlanLimits(user.subscription.plan);
  }

  private formatPlanLimits(plan: Plan): UsageLimits {
    return {
      maxPrompts: plan.maxPrompts,
      maxTokens: plan.maxTokens,
      maxTeamMembers: plan.maxTeamMembers,
      features: plan.features
    };
  }

  private async getUsageByDay(userId: string): Promise<{ date: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usage = await prisma.promptUsage.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    });

    return usage.map(u => ({
      date: u.createdAt.toISOString().split('T')[0],
      count: u._count
    }));
  }

  private async getUsageByFeature(userId: string): Promise<{ feature: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usage = await prisma.featureUsage.groupBy({
      by: ['feature'],
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    });

    return usage.map((u: { feature: string; _count: number }) => ({
      feature: u.feature,
      count: u._count
    }));
  }

  private getCachedMetrics(userId: string): UsageMetrics | null {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.metrics;
    }
    return null;
  }

  private setCachedMetrics(userId: string, metrics: UsageMetrics): void {
    this.cache.set(userId, { metrics, timestamp: Date.now() });
  }

  private invalidateCache(userId: string): void {
    this.cache.delete(userId);
  }
} 