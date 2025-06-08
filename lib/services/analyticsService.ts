import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface AnalyticsOptions {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  type?: 'users' | 'prompts' | 'usage' | 'all';
  userId?: string;
  promptId?: string;
}

interface AnalyticsData {
  viewCount: number;
  usageCount: number;
  upvotes: number;
  copyCount: number;
  commentsCount: number;
  recentViews: Array<{
    id: string;
    createdAt: string;
    user?: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  recentUsages: Array<{
    id: string;
    createdAt: string;
    result?: string;
    user: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  recentCopies: Array<{
    id: string;
    createdAt: string;
    user?: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
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

  private async validateAdminAccess(): Promise<void> {
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
  }

  private async getPromptMetrics(promptId: string) {
    const [viewCount, usageCount, upvotes, copyCount, commentsCount] = await Promise.all([
      prisma.promptView.count({ where: { promptId } }),
      prisma.promptUsage.count({ where: { promptId } }),
      prisma.vote.count({ where: { promptId, value: 1 } }),
      prisma.promptCopy.count({ where: { promptId } }),
      prisma.comment.count({ where: { promptId } })
    ]);

    return { viewCount, usageCount, upvotes, copyCount, commentsCount };
  }

  private async getRecentActivity(promptId: string) {
    const [recentViews, recentUsages, recentCopies] = await Promise.all([
      prisma.promptView.findMany({
        where: { promptId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          prompt: {
            select: {
              user: {
                select: {
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      }),
      prisma.promptUsage.findMany({
        where: { promptId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      }),
      prisma.promptCopy.findMany({
        where: { promptId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      })
    ]);

    return { recentViews, recentUsages, recentCopies };
  }

  private async getDashboardOverview() {
    const [totalPromptViews, totalPromptCopies, mostPopularPrompt, mostActiveUser] = await Promise.all([
      prisma.promptView.count(),
      prisma.promptCopy.count(),
      prisma.prompt.findFirst({
        orderBy: { viewCount: 'desc' },
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.$queryRaw<{ name: string | null }[]>`
        WITH user_view_counts AS (
          SELECT "userId", COUNT(*) as view_count
          FROM "PromptView"
          WHERE "userId" IS NOT NULL
          GROUP BY "userId"
          ORDER BY view_count DESC
          LIMIT 1
        )
        SELECT u.name
        FROM "User" u
        JOIN user_view_counts uvc ON u.id = uvc."userId"
      `.then(results => results[0] || null)
    ]);

    return { totalPromptViews, totalPromptCopies, mostPopularPrompt, mostActiveUser };
  }

  public async getAnalytics(options: AnalyticsOptions): Promise<AnalyticsData> {
    await this.validateAdminAccess();

    const promptId = options.promptId;
    const [metrics, activity, overview] = await Promise.all([
      promptId ? this.getPromptMetrics(promptId) : {
        viewCount: 0,
        usageCount: 0,
        upvotes: 0,
        copyCount: 0,
        commentsCount: 0
      },
      promptId ? this.getRecentActivity(promptId) : {
        recentViews: [],
        recentUsages: [],
        recentCopies: []
      },
      this.getDashboardOverview()
    ]);

    const { viewCount, usageCount, upvotes, copyCount, commentsCount } = metrics;
    const { recentViews, recentUsages, recentCopies } = activity;
    const { totalPromptViews, totalPromptCopies, mostPopularPrompt, mostActiveUser } = overview;

    return {
      viewCount,
      usageCount,
      upvotes,
      copyCount,
      commentsCount,
      recentViews: recentViews.map(view => ({
        id: view.id,
        createdAt: view.createdAt.toISOString(),
        user: view.prompt.user ? {
          name: view.prompt.user.name,
          imageUrl: view.prompt.user.imageUrl
        } : undefined
      })),
      recentUsages: recentUsages.map(usage => ({
        id: usage.id,
        createdAt: usage.createdAt.toISOString(),
        result: usage.result as string | undefined,
        user: {
          name: usage.user.name,
          imageUrl: usage.user.imageUrl
        }
      })),
      recentCopies: recentCopies.map(copy => ({
        id: copy.id,
        createdAt: copy.createdAt.toISOString(),
        user: copy.user ? {
          name: copy.user.name,
          imageUrl: copy.user.imageUrl
        } : undefined
      })),
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      totalPrompts: await prisma.prompt.count(),
      totalGenerations: await prisma.promptUsage.count(),
      averageResponseTime: 0, // TODO: Implement response time calculation
      successRate: 0, // TODO: Implement success rate calculation
      dashboardOverview: {
        totalPromptViews,
        totalPromptCopies,
        mostPopularPrompt,
        mostActiveUser,
        recentActivity: {
          usages: recentUsages.map(usage => ({
            id: usage.id,
            createdAt: usage.createdAt.toISOString(),
            user: {
              name: usage.user.name
            },
            prompt: {
              name: 'Prompt' // TODO: Include prompt name in the query
            }
          }))
        }
      }
    };
  }
}

// Export a singleton instance
export const analyticsService = AnalyticsService.getInstance();
