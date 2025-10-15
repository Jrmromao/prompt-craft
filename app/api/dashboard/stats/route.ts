import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

export async function GET() {
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

    // Get current month stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalRuns, monthlyRuns, stats] = await Promise.all([
      // Total runs all time
      prisma.promptRun.count({
        where: { userId: user.id },
      }),
      // Runs this month
      prisma.promptRun.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      // Aggregate stats
      prisma.promptRun.aggregate({
        where: { userId: user.id },
        _sum: { cost: true, tokensUsed: true },
        _avg: { cost: true, latency: true },
      }),
    ]);

    // Success rate
    const successfulRuns = await prisma.promptRun.count({
      where: { userId: user.id, success: true },
    });
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    // Get plan limits
    const plan = PLANS[user.planType as keyof typeof PLANS] || PLANS.FREE;

    return NextResponse.json({
      totalRuns,
      monthlyRuns,
      monthlyLimit: plan.limits.trackedRuns,
      totalCost: stats._sum.cost || 0,
      avgCostPerRun: stats._avg.cost || 0,
      avgLatency: stats._avg.latency || 0,
      totalTokens: stats._sum.tokensUsed || 0,
      successRate: Math.round(successRate * 10) / 10,
      plan: user.planType,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
