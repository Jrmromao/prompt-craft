import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function analyticsHandler() {
  const [totalUsers, totalPrompts, totalUsage, dashboardOverview, recentLogs] = await Promise.all([
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
  ]);

  return NextResponse.json({
    totalUsers,
    totalPrompts,
    totalUsage,
    dashboardOverview,
    recentLogs,
  });
}

// Define fallback data
const fallbackData = {
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
};

// Export the wrapped handler
export const GET = withDynamicRoute(analyticsHandler, fallbackData);

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
