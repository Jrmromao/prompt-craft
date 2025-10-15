import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '@/lib/services/analyticsService';

export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const analyticsService = AnalyticsService.getInstance();
    
    const [overview, modelBreakdown, timeSeries, expensivePrompts] = await Promise.all([
      analyticsService.getOverview(user.id, startDate, endDate),
      analyticsService.getModelBreakdown(user.id, startDate, endDate),
      analyticsService.getTimeSeriesData(user.id, startDate, endDate, 'day'),
      analyticsService.getMostExpensivePrompts(user.id, startDate, endDate, 5),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview,
        modelBreakdown,
        timeSeries,
        expensivePrompts,
        period,
      },
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
