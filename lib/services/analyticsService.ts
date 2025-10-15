/**
 * Analytics Service
 * Aggregates and analyzes prompt usage data
 */

import { prisma } from '@/lib/prisma';
import { CacheService } from './cacheService';

export interface AnalyticsOverview {
  totalRuns: number;
  totalCost: number;
  totalTokens: number;
  avgCostPerRun: number;
  successRate: number;
  avgLatency: number;
  periodComparison: {
    runs: number;
    cost: number;
  };
}

export interface ModelBreakdown {
  model: string;
  runs: number;
  cost: number;
  tokens: number;
  avgCost: number;
  successRate: number;
}

export interface TimeSeriesData {
  date: string;
  runs: number;
  cost: number;
  tokens: number;
  successRate: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private cache = CacheService.getInstance();

  static getInstance(): AnalyticsService {
    if (!this.instance) {
      this.instance = new AnalyticsService();
    }
    return this.instance;
  }

  async getOverview(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsOverview> {
    // Check cache
    const cacheKey = this.cache.getUserAnalytics(userId, `${startDate.getTime()}-${endDate.getTime()}`);
    const cached = await this.cache.get<AnalyticsOverview>(cacheKey);
    if (cached) return cached;

    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalRuns = runs.length;
    const totalCost = runs.reduce((sum, run) => sum + run.cost, 0);
    const totalTokens = runs.reduce((sum, run) => sum + run.totalTokens, 0);
    const avgCostPerRun = totalRuns > 0 ? totalCost / totalRuns : 0;
    
    const successfulRuns = runs.filter(run => run.success === true).length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;
    
    const avgLatency = totalRuns > 0
      ? runs.reduce((sum, run) => sum + run.latency, 0) / totalRuns
      : 0;

    // Previous period comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = startDate;

    const prevRuns = await prisma.promptRun.count({
      where: {
        userId,
        createdAt: {
          gte: prevStartDate,
          lt: prevEndDate,
        },
      },
    });

    const prevCost = await prisma.promptRun.aggregate({
      where: {
        userId,
        createdAt: {
          gte: prevStartDate,
          lt: prevEndDate,
        },
      },
      _sum: {
        cost: true,
      },
    });

    const result = {
      totalRuns,
      totalCost,
      totalTokens,
      avgCostPerRun,
      successRate,
      avgLatency,
      periodComparison: {
        runs: totalRuns - prevRuns,
        cost: totalCost - (prevCost._sum.cost || 0),
      },
    };

    // Cache result
    await this.cache.set(cacheKey, result, 300);

    return result;
  }

  async getModelBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ModelBreakdown[]> {
    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const modelMap = new Map<string, ModelBreakdown>();

    runs.forEach(run => {
      const existing = modelMap.get(run.model) || {
        model: run.model,
        runs: 0,
        cost: 0,
        tokens: 0,
        avgCost: 0,
        successRate: 0,
      };

      existing.runs += 1;
      existing.cost += run.cost;
      existing.tokens += run.totalTokens;

      modelMap.set(run.model, existing);
    });

    return Array.from(modelMap.values()).map(breakdown => ({
      ...breakdown,
      avgCost: breakdown.cost / breakdown.runs,
      successRate: this.calculateSuccessRate(
        runs.filter(r => r.model === breakdown.model)
      ),
    })).sort((a, b) => b.cost - a.cost);
  }

  async getTimeSeriesData(
    userId: string,
    startDate: Date,
    endDate: Date,
    granularity: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const dataMap = new Map<string, TimeSeriesData>();

    runs.forEach(run => {
      const dateKey = this.getDateKey(run.createdAt, granularity);
      const existing = dataMap.get(dateKey) || {
        date: dateKey,
        runs: 0,
        cost: 0,
        tokens: 0,
        successRate: 0,
      };

      existing.runs += 1;
      existing.cost += run.cost;
      existing.tokens += run.totalTokens;

      dataMap.set(dateKey, existing);
    });

    return Array.from(dataMap.values()).map(data => ({
      ...data,
      successRate: this.calculateSuccessRate(
        runs.filter(r => this.getDateKey(r.createdAt, granularity) === data.date)
      ),
    }));
  }

  async getMostExpensivePrompts(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ) {
    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        promptId: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const promptMap = new Map<string, {
      promptId: string;
      title: string;
      totalCost: number;
      runs: number;
      avgCost: number;
    }>();

    runs.forEach(run => {
      if (!run.promptId || !run.prompt) return;

      const existing = promptMap.get(run.promptId) || {
        promptId: run.promptId,
        title: run.prompt.title,
        totalCost: 0,
        runs: 0,
        avgCost: 0,
      };

      existing.totalCost += run.cost;
      existing.runs += 1;

      promptMap.set(run.promptId, existing);
    });

    return Array.from(promptMap.values())
      .map(p => ({ ...p, avgCost: p.totalCost / p.runs }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  private calculateSuccessRate(runs: any[]): number {
    if (runs.length === 0) return 0;
    const successful = runs.filter(r => r.success === true).length;
    return (successful / runs.length) * 100;
  }

  private getDateKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    
    if (granularity === 'day') {
      return d.toISOString().split('T')[0];
    }
    
    if (granularity === 'week') {
      const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${week}`;
    }
    
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
