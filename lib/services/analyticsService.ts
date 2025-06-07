import { prisma } from '@/lib/prisma';
import { PlanType, Prisma } from '@prisma/client';

interface AnalyticsOptions {
  period: string;
  type: string;
  userId: string;
}

interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  planDistribution: Array<{
    plan: PlanType;
    count: number;
  }>;
}

interface PromptAnalytics {
  totalPrompts: number;
  newPrompts: number;
  popularPrompts: Array<{
    id: string;
    name: string;
    upvotes: number;
    user: {
      name: string | null;
    };
  }>;
}

interface UsageAnalytics {
  totalUsage: number;
  usageByPrompt: Array<{
    promptId: string;
    count: number;
  }>;
  recentUsage: Array<{
    id: string;
    createdAt: Date;
    user: {
      name: string | null;
    };
    prompt: {
      name: string;
    };
  }>;
}

export interface AllAnalytics {
  totalUsers: number;
  newUsers: number;
  planDistribution: Array<{
    plan: PlanType;
    count: number;
  }>;
  totalPrompts: number;
  newPrompts: number;
  popularPrompts: Array<{
    id: string;
    name: string;
    upvotes: number;
    user: {
      name: string | null;
    };
  }>;
  totalUsage: number;
  usageByPrompt: Array<{
    promptId: string;
    count: number;
  }>;
  recentUsage: Array<{
    id: string;
    createdAt: Date;
    user: {
      name: string | null;
    };
    prompt: {
      name: string;
    };
  }>;
  dashboardOverview: {
    totalPromptViews: number;
    totalPromptCopies: number;
    mostPopularPrompt: {
      name: string;
      user: {
        name: string | null;
      };
    } | null;
    mostActiveUser: {
      name: string | null;
      email: string;
    } | null;
    recentActivity: {
      usages: Array<{
        id: string;
        createdAt: Date;
        user: {
          name: string | null;
        };
        prompt: {
          name: string;
        };
      }>;
    };
  };
}

type AnalyticsData = UserAnalytics | PromptAnalytics | UsageAnalytics | AllAnalytics;

class AnalyticsService {
  private static instance: AnalyticsService | null = null;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getAnalytics(options: AnalyticsOptions): Promise<AnalyticsData> {
    const { period, type, userId } = options;

    // Get date range based on period
    const dateRange = this.getDateRange(period);
    const startDate = dateRange.start;
    const endDate = dateRange.end;

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new Error('Unauthorized to access analytics');
    }

    // Get analytics based on type
    switch (type) {
      case 'users':
        return this.getUserAnalytics(startDate, endDate);
      case 'prompts':
        return this.getPromptAnalytics(startDate, endDate);
      case 'usage':
        return this.getUsageAnalytics(startDate, endDate);
      case 'all':
        return this.getAllAnalytics(startDate, endDate);
      default:
        throw new Error('Invalid analytics type');
    }
  }

  private async getUserAnalytics(startDate: Date, endDate: Date): Promise<UserAnalytics> {
    const [totalUsers, newUsers, planDistribution] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.user.groupBy({
        by: ['planType'],
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      newUsers,
      planDistribution: planDistribution.map(({ planType, _count }) => ({
        plan: planType,
        count: _count,
      })),
    };
  }

  private async getPromptAnalytics(startDate: Date, endDate: Date): Promise<PromptAnalytics> {
    const [totalPrompts, newPrompts, popularPrompts] = await Promise.all([
      prisma.prompt.count(),
      prisma.prompt.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.prompt.findMany({
        take: 5,
        orderBy: {
          upvotes: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      totalPrompts,
      newPrompts,
      popularPrompts,
    };
  }

  private async getUsageAnalytics(startDate: Date, endDate: Date): Promise<UsageAnalytics> {
    const [totalUsage, usageByType, recentUsage] = await Promise.all([
      prisma.promptUsage.count(),
      prisma.promptUsage.groupBy({
        by: ['promptId'],
        _count: true,
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.promptUsage.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          prompt: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      totalUsage,
      usageByPrompt: usageByType.map(({ promptId, _count }) => ({
        promptId,
        count: _count,
      })),
      recentUsage,
    };
  }

  private async getAllAnalytics(startDate: Date, endDate: Date): Promise<AllAnalytics> {
    const [userAnalytics, promptAnalytics, usageAnalytics] = await Promise.all([
      this.getUserAnalytics(startDate, endDate),
      this.getPromptAnalytics(startDate, endDate),
      this.getUsageAnalytics(startDate, endDate),
    ]);

    return {
      ...userAnalytics,
      ...promptAnalytics,
      ...usageAnalytics,
      dashboardOverview: {
        totalPromptViews: usageAnalytics.totalUsage,
        totalPromptCopies: usageAnalytics.totalUsage,
        mostPopularPrompt: promptAnalytics.popularPrompts[0] || null,
        mostActiveUser: null, // You can populate this if needed
        recentActivity: {
          usages: usageAnalytics.recentUsage,
        },
      },
    };
  }

  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 7); // Default to 7 days
    }

    return { start, end };
  }

  public async fetchPromptAnalytics() {
    // Use a default date range or allow for future extension
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const endDate = now;
    return this.getPromptAnalytics(startDate, endDate);
  }
}

// Export a singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Export the class for testing purposes
export { AnalyticsService }; 