import { prisma } from '@/lib/prisma';

interface SavingsBreakdown {
  totalSaved: number;
  smartRouting: number;
  caching: number;
  optimization: number;
  baselineCost: number;
  actualCost: number;
  savingsRate: number;
}

interface DailySavings {
  date: string;
  saved: number;
  baseline: number;
  actual: number;
}

export class SavingsCalculator {
  // Calculate baseline cost (what it WOULD have cost without optimization)
  static calculateBaselineCost(
    requestedModel: string,
    actualModel: string,
    tokens: number
  ): number {
    const pricing: Record<string, number> = {
      'gpt-4': 0.045,
      'gpt-4-turbo': 0.02,
      'gpt-3.5-turbo': 0.001,
      'claude-3-opus': 0.045,
      'claude-3-sonnet': 0.009,
      'claude-3-haiku': 0.000875,
      'gemini-1.5-pro': 0.003125,
      'gemini-1.5-flash': 0.0001875,
    };

    // Find pricing for requested model
    const requestedRate = Object.entries(pricing).find(([key]) =>
      requestedModel.includes(key)
    )?.[1] || 0.01;

    return (tokens / 1000) * requestedRate;
  }

  // Get savings for a specific time period
  static async getSavings(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SavingsBreakdown> {
    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        model: true,
        requestedModel: true,
        tokensUsed: true,
        cost: true,
        savings: true,
        inputTokens: true,
        outputTokens: true,
      },
    });

    let smartRoutingSavings = 0;
    let cachingSavings = 0;
    let optimizationSavings = 0;
    let totalBaseline = 0;
    let totalActual = 0;

    for (const run of runs) {
      const actualCost = run.cost || 0;
      totalActual += actualCost;

      // Calculate baseline (what it would have cost)
      const requestedModel = run.requestedModel || run.model;
      const baselineCost = this.calculateBaselineCost(
        requestedModel,
        run.model,
        run.tokensUsed
      );
      totalBaseline += baselineCost;

      // Smart routing savings (when we routed to cheaper model)
      if (run.savings && run.savings > 0) {
        smartRoutingSavings += run.savings;
      } else if (requestedModel !== run.model) {
        // Fallback calculation if savings not stored
        const saved = baselineCost - actualCost;
        if (saved > 0) smartRoutingSavings += saved;
      }
    }

    // Get cache savings from Redis stats
    const { CacheService } = await import('./cacheService');
    const cacheStats = await CacheService.getStats(
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    cachingSavings = cacheStats.savedCost;

    // TODO: Add optimization savings when optimizer is built
    optimizationSavings = 0;

    const totalSaved = smartRoutingSavings + cachingSavings + optimizationSavings;
    const savingsRate = totalBaseline > 0 ? (totalSaved / totalBaseline) * 100 : 0;

    return {
      totalSaved: Math.round(totalSaved * 100) / 100,
      smartRouting: Math.round(smartRoutingSavings * 100) / 100,
      caching: Math.round(cachingSavings * 100) / 100,
      optimization: Math.round(optimizationSavings * 100) / 100,
      baselineCost: Math.round(totalBaseline * 100) / 100,
      actualCost: Math.round(totalActual * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
    };
  }

  // Get today's savings
  static async getTodaySavings(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const savings = await this.getSavings(userId, today, tomorrow);
    return savings.totalSaved;
  }

  // Get daily savings for chart
  static async getDailySavings(
    userId: string,
    days: number = 30
  ): Promise<DailySavings[]> {
    const result: DailySavings[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const savings = await this.getSavings(userId, date, nextDay);

      result.push({
        date: date.toISOString().split('T')[0],
        saved: savings.totalSaved,
        baseline: savings.baselineCost,
        actual: savings.actualCost,
      });
    }

    return result;
  }

  // Calculate ROI (return on investment)
  static calculateROI(totalSaved: number, subscriptionCost: number): number {
    if (subscriptionCost === 0) return 0;
    return Math.round(((totalSaved - subscriptionCost) / subscriptionCost) * 100);
  }

  // Get savings summary for dashboard
  static async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today);
    startOfMonth.setDate(1);

    const [todaySavings, monthlySavings] = await Promise.all([
      this.getSavings(userId, today, tomorrow),
      this.getSavings(userId, startOfMonth, tomorrow),
    ]);

    // Get user's plan cost
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    const subscriptionCost = user?.planType === 'PRO' ? 9 : 0;
    const roi = this.calculateROI(monthlySavings.totalSaved, subscriptionCost);

    return {
      today: todaySavings.totalSaved,
      month: monthlySavings.totalSaved,
      breakdown: monthlySavings,
      roi,
      subscriptionCost,
    };
  }
}
