import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Force dynamic execution and disable static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add runtime configuration
export const runtime = 'nodejs';

export async function GET() {
  // Check if we're in a build environment
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    try {
      const [totalUsers, totalPrompts, totalUsage, dashboardOverview, recentLogs] = await Promise.all(
        [
          prisma.user.count(),
          prisma.prompt.count(),
          prisma.promptUsage.count(),
          getDashboardOverview(),
          prisma.auditLog.findMany({
            take: 10,
            orderBy: { timestamp: 'desc' },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          }),
        ]
      );

      return NextResponse.json({
        totalUsers,
        totalPrompts,
        totalUsage,
        dashboardOverview,
        recentLogs,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }

  // Return empty data during build time
  return NextResponse.json({
    totalUsers: 0,
    totalPrompts: 0,
    totalUsage: 0,
    dashboardOverview: {
      totalPromptViews: 0,
      totalPromptCopies: 0,
      mostPopularPrompt: null,
      mostActiveUser: null,
      recentActivity: { usages: [] },
    },
    recentLogs: [],
  });
}

async function getDashboardOverview() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalPromptViews, totalPromptCopies, mostPopularPrompt, mostActiveUser, recentActivity] =
    await Promise.all([
      prisma.promptUsage.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.promptCopy.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.prompt.findFirst({
        orderBy: {
          usages: {
            _count: 'desc',
          },
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.user.findFirst({
        orderBy: {
          promptUsages: {
            _count: 'desc',
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
    totalPromptViews,
    totalPromptCopies,
    mostPopularPrompt,
    mostActiveUser,
    recentActivity: {
      usages: recentActivity,
    },
  };
}
