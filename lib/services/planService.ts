import { PLANS, Plan, hasFeature, PlanType } from '@/app/constants/plans';
import { PrismaClient } from '@prisma/client';
import { ServiceError } from './types';

const prisma = new PrismaClient();

export class PlanService {
  private static async getUserWithPlan(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) {
      throw new ServiceError('Invalid plan', 'INVALID_PLAN');
    }

    return { user, plan };
  }

  /**
   * Check if a user can access a specific feature based on their plan
   */
  static async canAccessFeature(userId: string, featureName: string): Promise<boolean> {
    const { plan } = await this.getUserWithPlan(userId);
    return hasFeature(plan, featureName);
  }

  /**
   * Check if a user can use a specific model based on their plan
   */
  static async canUseModel(userId: string, modelName: 'gpt35' | 'gpt4'): Promise<boolean> {
    const { plan } = await this.getUserWithPlan(userId);
    return plan.models[modelName];
  }

  /**
   * Check if a user has BYOK enabled
   */
  static async hasBYOKEnabled(userId: string): Promise<boolean> {
    const { plan } = await this.getUserWithPlan(userId);
    return plan.byok.enabled;
  }

  /**
   * Get the current plan details for a user
   */
  static async getUserPlan(userId: string): Promise<Plan> {
    const { plan } = await this.getUserWithPlan(userId);
    return plan;
  }

  /**
   * Check if a plan has unlimited credits
   */
  static async hasUnlimitedCredits(userId: string): Promise<boolean> {
    const { plan } = await this.getUserWithPlan(userId);
    return plan.credits.included === -1;
  }
} 