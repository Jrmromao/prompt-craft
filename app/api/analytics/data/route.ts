import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get runs for time period
    const runs = await prisma.promptRun.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        createdAt: true,
        model: true,
        provider: true,
        cost: true,
        tokensUsed: true,
        latency: true,
        success: true,
      },
    });

    // Group by day for chart
    const dailyData = runs.reduce((acc: any, run) => {
      const date = run.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, runs: 0, cost: 0, tokens: 0 };
      }
      acc[date].runs += 1;
      acc[date].cost += run.cost;
      acc[date].tokens += run.tokensUsed;
      return acc;
    }, {});

    // Group by model
    const byModel = runs.reduce((acc: any, run) => {
      if (!acc[run.model]) {
        acc[run.model] = { model: run.model, runs: 0, cost: 0 };
      }
      acc[run.model].runs += 1;
      acc[run.model].cost += run.cost;
      return acc;
    }, {});

    // Group by provider
    const byProvider = runs.reduce((acc: any, run) => {
      if (!acc[run.provider]) {
        acc[run.provider] = { provider: run.provider, runs: 0, cost: 0 };
      }
      acc[run.provider].runs += 1;
      acc[run.provider].cost += run.cost;
      return acc;
    }, {});

    return NextResponse.json({
      dailyData: Object.values(dailyData),
      byModel: Object.values(byModel),
      byProvider: Object.values(byProvider),
      totalRuns: runs.length,
      totalCost: runs.reduce((sum, r) => sum + r.cost, 0),
      avgLatency: runs.length > 0 ? runs.reduce((sum, r) => sum + r.latency, 0) / runs.length : 0,
      successRate: runs.length > 0 ? (runs.filter(r => r.success).length / runs.length) * 100 : 0,
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
