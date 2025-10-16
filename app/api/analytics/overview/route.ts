import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        PromptRun: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const runs = user.PromptRun;
    const totalRuns = runs.length;
    const totalCost = runs.reduce((sum, run) => sum + (run.cost || 0), 0);
    const totalTokens = runs.reduce((sum, run) => sum + (run.inputTokens || 0) + (run.outputTokens || 0), 0);
    const successfulRuns = runs.filter(run => run.success).length;
    const totalLatency = runs.reduce((sum, run) => sum + (run.latency || 0), 0);

    return NextResponse.json({
      totalRuns,
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalTokens,
      avgCostPerRun: totalRuns > 0 ? parseFloat((totalCost / totalRuns).toFixed(4)) : 0,
      successRate: totalRuns > 0 ? parseFloat(((successfulRuns / totalRuns) * 100).toFixed(1)) : 100,
      avgLatency: totalRuns > 0 ? Math.round(totalLatency / totalRuns) : 0,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
