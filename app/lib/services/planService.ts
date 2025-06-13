import { PLANS, Plan, hasFeature, isPostMVPFeature } from '@/app/constants/plans';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../auditLogger';
import { AuditAction } from '@/app/constants/audit';

const prisma = new PrismaClient();

export class PlanService {
  /**
   * Check if a user can access a specific feature based on their plan
   */
  static async canAccessFeature(userId: string, featureName: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return hasFeature(plan, featureName);
  }

  /**
   * Check if a feature is post-MVP for a user's plan
   */
  static async isPostMVPFeature(userId: string, featureName: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return isPostMVPFeature(plan, featureName);
  }

  /**
   * Check if a user has enough credits for an operation
   */
  static async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        planType: true,
        credits: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Elite and Enterprise plans don't use credits
    if (!plan.credits.enabled) {
      return true;
    }

    return user.credits >= requiredCredits;
  }

  /**
   * Deduct credits from a user's balance
   */
  static async deductCredits(userId: string, amount: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        planType: true,
        credits: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Elite and Enterprise plans don't use credits
    if (!plan.credits.enabled) {
      return;
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount
        }
      }
    });

    // Log the credit deduction
    await logAudit({
      userId,
      action: AuditAction.CREDITS_DEDUCTED,
      resource: 'credits',
      details: {
        amount,
        remainingBalance: user.credits - amount
      }
    });
  }

  /**
   * Add credits to a user's balance
   */
  static async addCredits(userId: string, amount: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        planType: true,
        credits: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Elite and Enterprise plans don't use credits
    if (!plan.credits.enabled) {
      return;
    }

    // Check minimum purchase amount
    if (amount < plan.credits.minimumPurchase) {
      throw new Error(`Minimum purchase amount is ${plan.credits.minimumPurchase} credits`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount
        }
      }
    });

    // Log the credit addition
    await logAudit({
      userId,
      action: AuditAction.CREDITS_ADDED,
      resource: 'credits',
      details: {
        amount,
        newBalance: user.credits + amount
      }
    });
  }

  /**
   * Check if a user can use a specific model based on their plan
   */
  static async canUseModel(userId: string, modelName: 'deepseek' | 'gpt35' | 'premium'): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return plan.models[modelName];
  }

  /**
   * Check if a user has BYOK enabled and if it provides unlimited test runs
   */
  static async hasBYOKUnlimitedTestRuns(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return plan.byok.enabled && plan.byok.unlimitedTestRuns;
  }

  /**
   * Get the current plan details for a user
   */
  static async getUserPlan(userId: string): Promise<Plan> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return plan;
  }
} 