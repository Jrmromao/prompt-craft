import { prisma } from '@/lib/prisma';
import { calculateApiCost, COST_LIMITS, costToCredits } from '@/app/constants/modelCosts';

interface CostRecord {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  credits: number;
  timestamp: Date;
}

interface MonthlyCostSummary {
  totalCostUSD: number;
  totalCredits: number;
  apiCallCount: number;
  byModel: Record<string, { cost: number; calls: number }>;
  isNearLimit: boolean;
  isOverLimit: boolean;
  remainingBudget: number;
}

export class CostTrackingService {
  private static instance: CostTrackingService;
  private cache: Map<string, { summary: MonthlyCostSummary; timestamp: number }>;
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CostTrackingService {
    if (!CostTrackingService.instance) {
      CostTrackingService.instance = new CostTrackingService();
    }
    return CostTrackingService.instance;
  }

  /**
   * Track API cost for a user
   */
  async trackApiCost(record: CostRecord): Promise<void> {
    const costUSD = calculateApiCost(record.model, record.inputTokens, record.outputTokens);
    const credits = costToCredits(costUSD);

    await prisma.apiUsage.create({
      data: {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: record.userId,
        promptId: null,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        isCacheHit: false,
        createdAt: new Date()
      }
    });

    // Invalidate cache
    this.cache.delete(record.userId);
  }

  /**
   * Get user's monthly cost summary
   */
  async getUserMonthlyCost(userId: string, userPlan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'): Promise<MonthlyCostSummary> {
    // Check cache
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.summary;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await prisma.apiUsage.findMany({
      where: {
        userId,
        createdAt: { gte: startOfMonth }
      },
      select: {
        inputTokens: true,
        outputTokens: true,
        createdAt: true
      }
    });

    let totalCostUSD = 0;
    const byModel: Record<string, { cost: number; calls: number }> = {};

    // Calculate costs (assuming deepseek-chat for now - enhance later)
    usage.forEach(record => {
      const cost = calculateApiCost('deepseek-chat', record.inputTokens, record.outputTokens);
      totalCostUSD += cost;
      
      if (!byModel['deepseek-chat']) {
        byModel['deepseek-chat'] = { cost: 0, calls: 0 };
      }
      byModel['deepseek-chat'].cost += cost;
      byModel['deepseek-chat'].calls += 1;
    });

    const limit = COST_LIMITS[userPlan];
    const summary: MonthlyCostSummary = {
      totalCostUSD,
      totalCredits: costToCredits(totalCostUSD),
      apiCallCount: usage.length,
      byModel,
      isNearLimit: totalCostUSD >= limit * 0.8,
      isOverLimit: totalCostUSD >= limit,
      remainingBudget: Math.max(0, limit - totalCostUSD)
    };

    // Cache result
    this.cache.set(userId, { summary, timestamp: Date.now() });

    return summary;
  }

  /**
   * Check if user can afford operation
   */
  async canAffordOperation(
    userId: string,
    model: string,
    estimatedInputTokens: number,
    estimatedOutputTokens: number,
    userPlan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'
  ): Promise<{ allowed: boolean; reason?: string; currentCost: number; estimatedCost: number }> {
    const summary = await this.getUserMonthlyCost(userId, userPlan);
    const estimatedCost = calculateApiCost(model, estimatedInputTokens, estimatedOutputTokens);
    const projectedTotal = summary.totalCostUSD + estimatedCost;
    const limit = COST_LIMITS[userPlan];

    if (projectedTotal > limit) {
      return {
        allowed: false,
        reason: `Monthly cost limit reached ($${limit.toFixed(2)}). Current: $${summary.totalCostUSD.toFixed(4)}, Estimated: $${estimatedCost.toFixed(4)}`,
        currentCost: summary.totalCostUSD,
        estimatedCost
      };
    }

    return {
      allowed: true,
      currentCost: summary.totalCostUSD,
      estimatedCost
    };
  }

  /**
   * Enforce hard cap - switch to cheapest model if over limit
   */
  async enforceHardCap(
    userId: string,
    requestedModel: string,
    userPlan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'
  ): Promise<{ model: string; switched: boolean; reason?: string }> {
    const summary = await this.getUserMonthlyCost(userId, userPlan);
    const limit = COST_LIMITS[userPlan];

    if (summary.isOverLimit) {
      return {
        model: 'deepseek-coder-6.7b',
        switched: true,
        reason: `Monthly limit ($${limit}) reached. Switched to cheapest model.`
      };
    }

    if (summary.isNearLimit && requestedModel !== 'deepseek-chat' && requestedModel !== 'deepseek-coder-6.7b') {
      return {
        model: 'deepseek-chat',
        switched: true,
        reason: `Approaching monthly limit. Switched to affordable model.`
      };
    }

    return {
      model: requestedModel,
      switched: false
    };
  }

  /**
   * Get all users approaching limit (for admin alerts)
   */
  async getUsersApproachingLimit(threshold: number = 0.8): Promise<Array<{ userId: string; cost: number; limit: number }>> {
    const users = await prisma.user.findMany({
      select: { id: true, planType: true }
    });

    const approaching: Array<{ userId: string; cost: number; limit: number }> = [];

    for (const user of users) {
      const summary = await this.getUserMonthlyCost(user.id, user.planType as any);
      const limit = COST_LIMITS[user.planType as keyof typeof COST_LIMITS] || COST_LIMITS.FREE;
      
      if (summary.totalCostUSD >= limit * threshold) {
        approaching.push({
          userId: user.id,
          cost: summary.totalCostUSD,
          limit
        });
      }
    }

    return approaching;
  }

  /**
   * Get total platform costs (admin only)
   */
  async getPlatformCosts(startDate?: Date, endDate?: Date): Promise<{
    totalCostUSD: number;
    totalApiCalls: number;
    averageCostPerCall: number;
    byUser: Array<{ userId: string; cost: number; calls: number }>;
  }> {
    const start = startDate || new Date(new Date().setDate(1));
    const end = endDate || new Date();

    const usage = await prisma.apiUsage.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      select: {
        userId: true,
        inputTokens: true,
        outputTokens: true
      }
    });

    let totalCostUSD = 0;
    const byUser: Map<string, { cost: number; calls: number }> = new Map();

    usage.forEach(record => {
      const cost = calculateApiCost('deepseek-chat', record.inputTokens, record.outputTokens);
      totalCostUSD += cost;

      const userStats = byUser.get(record.userId) || { cost: 0, calls: 0 };
      userStats.cost += cost;
      userStats.calls += 1;
      byUser.set(record.userId, userStats);
    });

    return {
      totalCostUSD,
      totalApiCalls: usage.length,
      averageCostPerCall: usage.length > 0 ? totalCostUSD / usage.length : 0,
      byUser: Array.from(byUser.entries()).map(([userId, stats]) => ({
        userId,
        ...stats
      }))
    };
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
