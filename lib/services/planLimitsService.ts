import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';

export class PlanLimitsService {
  private static instance: PlanLimitsService;

  private constructor() {}

  public static getInstance(): PlanLimitsService {
    if (!PlanLimitsService.instance) {
      PlanLimitsService.instance = new PlanLimitsService();
    }
    return PlanLimitsService.instance;
  }

  async getFeatureLimit(planType: PlanType, feature: string): Promise<number> {
    const limit = await prisma.planLimits.findUnique({
      where: {
        planType_feature: {
          planType,
          feature,
        },
      },
    });

    return limit?.limit ?? 0;
  }

  async isFeatureAvailable(planType: PlanType, feature: string): Promise<boolean> {
    const limit = await this.getFeatureLimit(planType, feature);
    return limit !== 0;
  }

  async checkLimit(
    planType: PlanType,
    feature: string,
    currentCount: number
  ): Promise<{ allowed: boolean; limit: number; remaining: number }> {
    const limit = await this.getFeatureLimit(planType, feature);
    
    // -1 represents unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, remaining: -1 };
    }

    const remaining = Math.max(0, limit - currentCount);
    return {
      allowed: currentCount < limit,
      limit,
      remaining,
    };
  }

  async getFeatureDescription(planType: PlanType, feature: string): Promise<string | null> {
    const limit = await prisma.planLimits.findUnique({
      where: {
        planType_feature: {
          planType,
          feature,
        },
      },
    });

    return limit?.description ?? null;
  }
} 