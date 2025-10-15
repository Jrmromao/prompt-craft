import { prisma } from '@/lib/prisma';
import { AnalyticsService } from './analyticsService';

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!this.instance) {
      this.instance = new ExportService();
    }
    return this.instance;
  }

  async exportToCSV(userId: string, startDate: Date, endDate: Date): Promise<string> {
    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Date', 'Prompt ID', 'Model', 'Provider', 'Tokens', 'Cost', 'Latency', 'Success'];
    const rows = runs.map(run => [
      run.createdAt.toISOString(),
      run.promptId,
      run.model,
      run.provider,
      run.tokensUsed.toString(),
      run.cost.toFixed(4),
      run.latency.toString(),
      run.success ? 'Yes' : 'No',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async exportToJSON(userId: string, startDate: Date, endDate: Date) {
    const analyticsService = AnalyticsService.getInstance();
    
    const [overview, modelBreakdown, timeSeries, expensivePrompts] = await Promise.all([
      analyticsService.getOverview(userId, startDate, endDate),
      analyticsService.getModelBreakdown(userId, startDate, endDate),
      analyticsService.getTimeSeriesData(userId, startDate, endDate),
      analyticsService.getMostExpensivePrompts(userId, startDate, endDate, 10),
    ]);

    return {
      period: { start: startDate, end: endDate },
      overview,
      modelBreakdown,
      timeSeries,
      expensivePrompts,
      exportedAt: new Date(),
    };
  }

  async generateReport(userId: string, startDate: Date, endDate: Date) {
    const data = await this.exportToJSON(userId, startDate, endDate);
    
    return {
      title: 'AI Cost Analytics Report',
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      summary: {
        totalRuns: data.overview.totalRuns,
        totalCost: `$${data.overview.totalCost.toFixed(2)}`,
        avgCostPerRun: `$${data.overview.avgCostPerRun.toFixed(4)}`,
        successRate: `${data.overview.successRate.toFixed(1)}%`,
        avgLatency: `${data.overview.avgLatency.toFixed(0)}ms`,
      },
      topModels: data.modelBreakdown.slice(0, 5),
      recommendations: this.generateRecommendations(data),
    };
  }

  private generateRecommendations(data: any): string[] {
    const recommendations = [];

    // High cost models
    const expensiveModels = data.modelBreakdown.filter((m: any) => m.avgCost > 0.01);
    if (expensiveModels.length > 0) {
      recommendations.push(
        `Consider using cheaper models for ${expensiveModels[0].model} tasks (avg $${expensiveModels[0].avgCost.toFixed(4)}/run)`
      );
    }

    // Low success rate
    if (data.overview.successRate < 90) {
      recommendations.push(
        `Success rate is ${data.overview.successRate.toFixed(1)}% - review error logs and improve prompts`
      );
    }

    // High latency
    if (data.overview.avgLatency > 3000) {
      recommendations.push(
        `Average latency is ${data.overview.avgLatency.toFixed(0)}ms - consider caching or faster models`
      );
    }

    return recommendations;
  }
}
