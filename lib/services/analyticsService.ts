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
        commentsCount: 75,
        viewCount: 2500,
        usageCount: 1000,
        upvotes: 750,
        copyCount: 1200,
        recentViews: [
          {
            id: '1',
            createdAt: new Date().toISOString(),
            user: {
              name: 'Alice Johnson',
              imageUrl: null,
            },
          },
          {
            id: '2',
            createdAt: new Date().toISOString(),
            user: {
              name: 'Bob Wilson',
              imageUrl: null,
            },
          },
        ],
        recentUsages: [
          {
            id: '1',
            createdAt: new Date().toISOString(),
            user: {
              name: 'Alice Johnson',
              imageUrl: null,
            },
          },
          {
            id: '2',
            createdAt: new Date().toISOString(),
            user: {
              name: 'Bob Wilson',
              imageUrl: null,
            },
          },
        ],
        recentCopies: [
          {
            id: '1',
            createdAt: new Date().toISOString(),
            user: {
              name: 'Alice Johnson',
              imageUrl: null,
            },
          },
          {
            id: '2',
            createdAt: new Date().toISOString(),
            user: {
              name: 'Bob Wilson',
              imageUrl: null,
            },
          },
        ],
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

    // Get the prompt ID from the options
    const promptId = options.promptId;
    if (!promptId) {
      throw new Error('Prompt ID is required');
    }

    // Fetch actual data for the specific prompt
    const [viewCount, usageCount, upvotes, copyCount, commentsCount] = await Promise.all([
      prisma.promptView.count({
        where: { promptId }
      }),
      prisma.promptUsage.count({
        where: { promptId }
      }),
      prisma.vote.count({
        where: { 
          promptId,
          value: 1 // 1 represents an upvote
        }
      }),
      prisma.promptCopy.count({
        where: { promptId }
      }),
      prisma.comment.count({
        where: { promptId }
      })
    ]);

    // Fetch recent activity
    const [recentViews, recentUsages, recentCopies] = await Promise.all([
      prisma.promptView.findMany({
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

    return {
      viewCount,
      usageCount,
      upvotes,
      copyCount,
      commentsCount,
      recentViews: recentViews.map(view => ({
        id: view.id,
        createdAt: view.createdAt.toISOString(),
        user: view.user ? {
          name: view.user.name,
          imageUrl: view.user.imageUrl
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
      totalUsers: 0, // This would be calculated from actual data
      activeUsers: 0, // This would be calculated from actual data
      totalPrompts: 0, // This would be calculated from actual data
      totalGenerations: 0, // This would be calculated from actual data
      averageResponseTime: 0, // This would be calculated from actual data
      successRate: 0, // This would be calculated from actual data
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
