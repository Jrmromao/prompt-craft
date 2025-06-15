import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { trackUserFlowError } from '@/lib/error-tracking';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeRange === '30d' ? 30 : 7));

    // Fetch metrics
    const [
      totalUsers,
      activeUsers,
      totalPrompts,
      totalVersions,
      dailyActiveUsers,
      promptUsageByModel,
      errorDistribution
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastActiveAt: {
            gte: startDate
          }
        }
      }),
      prisma.prompt.count(),
      prisma.version.count(),
      prisma.user.groupBy({
        by: ['lastActiveAt'],
        where: {
          lastActiveAt: {
            gte: startDate
          }
        },
        _count: true
      }),
      prisma.prompt.groupBy({
        by: ['model'],
        _count: true
      }),
      prisma.error.groupBy({
        by: ['type'],
        _count: true
      })
    ]);

    // Calculate conversion rate
    const conversions = await prisma.version.count({
      where: {
        convertedToPrompt: true,
        createdAt: {
          gte: startDate
        }
      }
    });
    const conversionRate = totalVersions > 0 ? conversions / totalVersions : 0;

    // Calculate error rate
    const totalErrors = await prisma.error.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });
    const totalRequests = await prisma.prompt.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    // Calculate average response time
    const responseTimes = await prisma.prompt.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        responseTime: true
      }
    });
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / responseTimes.length
      : 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalPrompts,
      totalVersions,
      conversionRate,
      averageResponseTime,
      errorRate,
      dailyActiveUsers: dailyActiveUsers.map((d: { _count: number }) => d._count),
      promptUsageByModel: Object.fromEntries(
        promptUsageByModel.map((m: { model: string; _count: number }) => [m.model, m._count])
      ),
      errorDistribution: Object.fromEntries(
        errorDistribution.map((e: { type: string; _count: number }) => [e.type, e._count])
      )
    });
  } catch (error) {
    trackUserFlowError('admin_metrics', error as Error, {
      action: 'fetch_metrics',
      userId: (await auth()).userId
    });
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 