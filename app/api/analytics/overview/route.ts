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
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();

    console.log('Analytics query:', { userId, startDate, endDate, days });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        PromptRuns: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            }
          }
        }
      }
    });

    console.log('User found:', user?.email, 'Runs:', user?.PromptRuns.length);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const runs = user.PromptRuns;
    const totalRuns = runs.length;
    const totalCost = runs.reduce((sum, run) => sum + (run.cost || 0), 0);
    const totalTokens = runs.reduce((sum, run) => sum + (run.inputTokens || 0) + (run.outputTokens || 0), 0);
    const successfulRuns = runs.filter(run => run.success).length;
    const totalLatency = runs.reduce((sum, run) => sum + (run.latency || 0), 0);

    // Group by date
    const dailyMap = new Map<string, { runs: number; cost: number; tokens: number }>();
    runs.forEach(run => {
      const date = run.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { runs: 0, cost: 0, tokens: 0 };
      dailyMap.set(date, {
        runs: existing.runs + 1,
        cost: existing.cost + (run.cost || 0),
        tokens: existing.tokens + (run.inputTokens || 0) + (run.outputTokens || 0)
      });
    });
    const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));

    // Group by model
    const modelMap = new Map<string, { runs: number; cost: number }>();
    runs.forEach(run => {
      const existing = modelMap.get(run.model) || { runs: 0, cost: 0 };
      modelMap.set(run.model, {
        runs: existing.runs + 1,
        cost: existing.cost + (run.cost || 0)
      });
    });
    const byModel = Array.from(modelMap.entries()).map(([model, data]) => ({ model, ...data }));

    // Group by provider
    const providerMap = new Map<string, { runs: number; cost: number }>();
    runs.forEach(run => {
      const existing = providerMap.get(run.provider) || { runs: 0, cost: 0 };
      providerMap.set(run.provider, {
        runs: existing.runs + 1,
        cost: existing.cost + (run.cost || 0)
      });
    });
    const byProvider = Array.from(providerMap.entries()).map(([provider, data]) => ({ provider, ...data }));

    return NextResponse.json({
      totalRuns,
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalTokens,
      avgCostPerRun: totalRuns > 0 ? parseFloat((totalCost / totalRuns).toFixed(4)) : 0,
      successRate: totalRuns > 0 ? parseFloat(((successfulRuns / totalRuns) * 100).toFixed(1)) : 100,
      avgLatency: totalRuns > 0 ? Math.round(totalLatency / totalRuns) : 0,
      dailyData,
      byModel,
      byProvider,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
