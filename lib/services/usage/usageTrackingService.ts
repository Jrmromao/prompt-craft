import { prisma } from '@/lib/prisma';
import { Usage, Subscription, Plan } from '@prisma/client';

export class UsageTrackingService {
  private static instance: UsageTrackingService;

  private constructor() {
    // Verify Prisma client is initialized
    if (!prisma) {
      throw new Error('Prisma client is not initialized');
    }
  }

  public static getInstance(): UsageTrackingService {
    if (!UsageTrackingService.instance) {
      UsageTrackingService.instance = new UsageTrackingService();
    }
    return UsageTrackingService.instance;
  }

  public async trackUsage(userId: string, feature: string, count: number = 1): Promise<Usage> {
    // Get user's subscription and plan
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

    // Check if usage is within limits
    await this.checkUsageLimits(userId, feature, count, user.subscription);

    // Create usage record
    return prisma.usage.create({
      data: {
        userId,
        feature,
        count,
      },
    });
  }

  public async getUsageMetrics(userId: string): Promise<{
    prompts: number;
    tokens: number;
    team_members: number;
  }> {
    const [promptUsage, tokenUsage, teamMemberUsage] = await Promise.all([
      this.getFeatureUsage(userId, 'prompts'),
      this.getFeatureUsage(userId, 'tokens'),
      this.getFeatureUsage(userId, 'team_members'),
    ]);

    return {
      prompts: promptUsage,
      tokens: tokenUsage,
      team_members: teamMemberUsage,
    };
  }

  public async getUserLimits(userId: string): Promise<{
    maxPrompts: number;
    maxTokens: number;
    maxTeamMembers: number;
  }> {
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

    // Return default limits if no subscription is found
    if (!user?.subscription?.plan) {
      return {
        maxPrompts: 100, // Default free tier limits
        maxTokens: 1000,
        maxTeamMembers: 1
      };
    }

    const plan = user.subscription.plan;
    const features = JSON.parse(plan.features as unknown as string) as Record<string, number>;

    return {
      maxPrompts: features.maxPrompts || 100,
      maxTokens: features.maxTokens || 1000,
      maxTeamMembers: features.maxTeamMembers || 1
    };
  }

  private async getFeatureUsage(
    userId: string,
    feature: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<number> {
    try {
      const where = {
        userId,
        feature,
        ...(periodStart && periodEnd
          ? {
              timestamp: {
                gte: periodStart,
                lte: periodEnd,
              },
            }
          : {}),
      };

      console.log('Querying usage with params:', { userId, feature, where });

      const result = await prisma.usage.aggregate({
        where,
        _sum: {
          count: true,
        },
      });

      console.log('Usage query result:', result);

      return result._sum.count || 0;
    } catch (error) {
      console.error('Error in getFeatureUsage:', error);
      throw error;
    }
  }

  private async checkUsageLimits(
    userId: string,
    feature: string,
    count: number,
    subscription: Subscription & { plan: Plan }
  ): Promise<void> {
    const currentUsage = await this.getFeatureUsage(
      userId,
      feature,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    );

    const planFeatures = JSON.parse(subscription.plan.features as unknown as string) as Record<string, number>;
    const limit = planFeatures[`max${feature.charAt(0).toUpperCase() + feature.slice(1)}`] || 0;

    if (currentUsage + count > limit) {
      throw new Error(`Usage limit exceeded for feature: ${feature}`);
    }
  }

  public async getUsageHistory(
    userId: string,
    feature?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Usage[]> {
    return prisma.usage.findMany({
      where: {
        userId,
        ...(feature ? { feature } : {}),
        ...(startDate && endDate
          ? {
              timestamp: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  public async getCurrentPeriodUsage(
    userId: string,
    feature?: string
  ): Promise<Record<string, number>> {
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

    const usage = await prisma.usage.groupBy({
      by: ['feature'],
      where: {
        userId,
        ...(feature ? { feature } : {}),
        timestamp: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd,
        },
      },
      _sum: {
        count: true,
      },
    });

    return usage.reduce((acc, curr) => {
      acc[curr.feature] = curr._sum.count || 0;
      return acc;
    }, {} as Record<string, number>);
  }
} 