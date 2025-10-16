import { prisma } from '@/lib/prisma';

export class AnalyticsService {
  static async getOverview(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const totalCost = runs.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = runs.reduce((sum, r) => sum + r.tokensUsed, 0);

    return {
      totalRuns: runs.length,
      totalCost,
      totalTokens,
      avgCostPerRun: runs.length > 0 ? totalCost / runs.length : 0,
    };
  }
}
