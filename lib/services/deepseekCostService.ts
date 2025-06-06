import { prisma } from '@/lib/prisma';

export class DeepseekCostService {
  private static instance: DeepseekCostService;
  
  // DeepSeek API pricing (per million tokens)
  private readonly PRICING = {
    INPUT_CACHE_HIT: 0.07,
    INPUT_CACHE_MISS: 0.27,
    OUTPUT: 1.10
  };

  private constructor() {}

  public static getInstance(): DeepseekCostService {
    if (!DeepseekCostService.instance) {
      DeepseekCostService.instance = new DeepseekCostService();
    }
    return DeepseekCostService.instance;
  }

  public async getTotalUsage(): Promise<{
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    cacheHitRate: number;
    usageByDay: Array<{
      date: string;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }>;
  }> {
    // Get all API usage
    const usage = await prisma.apiUsage.findMany({
      select: {
        inputTokens: true,
        outputTokens: true,
        isCacheHit: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate totals
    const totalInputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0);
    const totalOutputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0);
    const cacheHits = usage.filter(u => u.isCacheHit).length;
    const cacheHitRate = usage.length > 0 ? (cacheHits / usage.length) * 100 : 0;

    // Calculate costs
    const inputCacheHitCost = (totalInputTokens * (cacheHitRate / 100) * this.PRICING.INPUT_CACHE_HIT) / 1000000;
    const inputCacheMissCost = (totalInputTokens * ((100 - cacheHitRate) / 100) * this.PRICING.INPUT_CACHE_MISS) / 1000000;
    const outputCost = (totalOutputTokens * this.PRICING.OUTPUT) / 1000000;
    const totalCost = inputCacheHitCost + inputCacheMissCost + outputCost;

    // Group usage by day
    const usageByDay = usage.reduce((acc: any, u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          inputTokens: 0,
          outputTokens: 0,
          cost: 0
        };
      }
      acc[date].inputTokens += u.inputTokens;
      acc[date].outputTokens += u.outputTokens;
      
      // Calculate cost for this usage
      const isCacheHit = u.isCacheHit;
      const inputCost = (u.inputTokens * (isCacheHit ? this.PRICING.INPUT_CACHE_HIT : this.PRICING.INPUT_CACHE_MISS)) / 1000000;
      const outputCost = (u.outputTokens * this.PRICING.OUTPUT) / 1000000;
      acc[date].cost += inputCost + outputCost;
      
      return acc;
    }, {});

    return {
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      cacheHitRate,
      usageByDay: Object.values(usageByDay)
    };
  }

  public async calculateMonthlyCosts(): Promise<{
    totalCost: number;
    inputTokens: number;
    outputTokens: number;
    cacheHitRate: number;
    breakdown: {
      inputCacheHit: number;
      inputCacheMiss: number;
      output: number;
    };
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all API usage for the current month
    const usage = await prisma.apiUsage.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: now
        }
      },
      select: {
        inputTokens: true,
        outputTokens: true,
        isCacheHit: true
      }
    });

    // Calculate totals
    const totalInputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0);
    const totalOutputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0);
    const cacheHits = usage.filter(u => u.isCacheHit).length;
    const cacheHitRate = usage.length > 0 ? (cacheHits / usage.length) * 100 : 0;

    // Calculate costs
    const inputCacheHitCost = (totalInputTokens * (cacheHitRate / 100) * this.PRICING.INPUT_CACHE_HIT) / 1000000;
    const inputCacheMissCost = (totalInputTokens * ((100 - cacheHitRate) / 100) * this.PRICING.INPUT_CACHE_MISS) / 1000000;
    const outputCost = (totalOutputTokens * this.PRICING.OUTPUT) / 1000000;

    const totalCost = inputCacheHitCost + inputCacheMissCost + outputCost;

    return {
      totalCost,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      cacheHitRate,
      breakdown: {
        inputCacheHit: inputCacheHitCost,
        inputCacheMiss: inputCacheMissCost,
        output: outputCost
      }
    };
  }
} 