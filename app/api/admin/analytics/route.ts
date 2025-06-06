import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const [
      totalUsers,
      totalPrompts,
      totalUsage,
      dashboardOverview,
      recentLogs
    ] = await Promise.all([
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
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getDashboardOverview() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalPromptViews,
    totalPromptCopies,
    mostPopularPrompt,
    mostActiveUser,
    recentActivity
  ] = await Promise.all([
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