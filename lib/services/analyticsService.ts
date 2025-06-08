import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface AnalyticsOptions {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  type?: 'users' | 'prompts' | 'usage' | 'all';
  userId?: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPrompts: number;
  totalGenerations: number;
  averageResponseTime: number;
  successRate: number;
  dashboardOverview: {
    totalPromptViews: number;
    totalPromptCopies: number;
    mostPopularPrompt: {
      user: {
        name: string | null;
      };
    } | null;
    mostActiveUser: {
      name: string | null;
    } | null;
    recentActivity: {
      usages: Array<{
        id: string;
        createdAt: string;
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

export class AnalyticsService {
  private static instance: AnalyticsService | null = null;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getAnalytics(options: AnalyticsOptions): Promise<AnalyticsData> {
    // Allow access in development mode
    if (process.env.NODE_ENV === 'development') {
      // Return mock data for development
      return {
        totalUsers: 100,
        activeUsers: 75,
        totalPrompts: 500,
        totalGenerations: 1000,
        averageResponseTime: 2.5,
        successRate: 0.95,
        dashboardOverview: {
          totalPromptViews: 2500,
          totalPromptCopies: 1200,
          mostPopularPrompt: {
            user: {
              name: 'John Doe',
            },
          },
          mostActiveUser: {
            name: 'Jane Smith',
          },
          recentActivity: {
            usages: [
              {
                id: '1',
                createdAt: new Date().toISOString(),
                user: {
                  name: 'Alice Johnson',
                },
                prompt: {
                  name: 'Creative Writing Assistant',
                },
              },
              {
                id: '2',
                createdAt: new Date().toISOString(),
                user: {
                  name: 'Bob Wilson',
                },
                prompt: {
                  name: 'Code Review Helper',
                },
              },
            ],
          },
        },
      };
    }

    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new Error('Unauthorized to access analytics');
    }

    // In production, fetch real data
    const [totalUsers, activeUsers, totalPrompts, totalGenerations] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.prompt.count(),
      prisma.promptUsage.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalPrompts,
      totalGenerations,
      averageResponseTime: 2.5, // This would be calculated from actual data
      successRate: 0.95, // This would be calculated from actual data
      dashboardOverview: {
        totalPromptViews: 0, // This would be calculated from actual data
        totalPromptCopies: 0, // This would be calculated from actual data
        mostPopularPrompt: null,
        mostActiveUser: null,
        recentActivity: {
          usages: [],
        },
      },
    };
  }
}

// Export a singleton instance
export const analyticsService = AnalyticsService.getInstance();
