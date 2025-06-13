import { prisma } from '@/lib/prisma';
import { CreditType, PlanType } from '@prisma/client';
import { PLANS } from '../../constants/plans';
import { logAudit } from '../../lib/auditLogger';
import { AuditAction } from '../../constants/audit';

export class CreditService {
  /**
   * Calculate credit cost for a token operation
   */
  static calculateTokenCost(inputTokens: number, outputTokens: number, model: string): number {
    const CREDIT_RATIOS = {
      'gpt-4': {
        input: 0.05,  // 5 credits per 100 tokens
        output: 0.075 // 7.5 credits per 100 tokens
      },
      'gpt-3.5-turbo': {
        input: 0.025,  // 2.5 credits per 100 tokens
        output: 0.0375 // 3.75 credits per 100 tokens
      }
    };

    const ratio = CREDIT_RATIOS[model as keyof typeof CREDIT_RATIOS] || CREDIT_RATIOS['gpt-3.5-turbo'];
    return Math.ceil((inputTokens * ratio.input) + (outputTokens * ratio.output));
  }

  /**
   * Check if user has enough credits for an operation
   */
  static async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, planType: true }
    });

    if (!user) return false;

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) return false;

    // Elite and Enterprise plans have unlimited credits
    if (!plan.credits.enabled) {
      return true;
    }

    return user.credits >= requiredCredits;
  }

  /**
   * Check if adding credits would exceed the plan's credit cap
   */
  static async wouldExceedCreditCap(userId: string, amount: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, planType: true }
    });

    if (!user) return true;

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) return true;

    // Elite and Enterprise plans have no credit cap
    if (!plan.credits.enabled) {
      return false;
    }

    return (user.credits + amount) > plan.limits.tokens;
  }

  /**
   * Deduct credits from user
   */
  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, planType: true }
    });

    if (!user) return false;

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) return false;

    // Elite and Enterprise plans have unlimited credits
    if (!plan.credits.enabled) {
      return true;
    }

    if (user.credits < amount) return false;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } }
      }),
      prisma.creditHistory.create({
        data: {
          userId,
          amount: -amount,
          type: CreditType.USAGE,
          description
        }
      })
    ]);

    await logAudit({
      userId,
      action: AuditAction.CREDITS_DEDUCTED,
      resource: 'credits',
      details: { amount, description, metadata }
    });

    return true;
  }

  /**
   * Add credits to user
   */
  static async addCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Check minimum purchase amount for credit-enabled plans
    if (plan.credits.enabled && amount < plan.credits.minimumPurchase) {
      throw new Error(`Minimum purchase amount is ${plan.credits.minimumPurchase} credits`);
    }

    // Check if adding credits would exceed the plan's credit cap
    if (plan.credits.enabled && await this.wouldExceedCreditCap(userId, amount)) {
      throw new Error(`Adding ${amount} credits would exceed your plan's credit cap of ${plan.limits.tokens}`);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } }
      }),
      prisma.creditHistory.create({
        data: {
          userId,
          amount,
          type: CreditType.TOP_UP,
          description
        }
      })
    ]);

    await logAudit({
      userId,
      action: AuditAction.CREDITS_ADDED,
      resource: 'credits',
      details: { amount, description, metadata }
    });
  }

  /**
   * Reset monthly credits based on plan
   */
  static async resetMonthlyCredits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) return;

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) return;

    // Only reset credits for plans that use the credit system
    if (!plan.credits.enabled) return;

    const newCredits = plan.limits.tokens;
    const currentCredits = (await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    }))?.credits || 0;

    if (newCredits > currentCredits) {
      const difference = newCredits - currentCredits;
      await this.addCredits(
        userId,
        difference,
        'Monthly credit reset',
        { planType: user.planType }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastCreditReset: new Date() }
    });
  }

  /**
   * Get credit usage history
   */
  static async getCreditHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ) {
    return prisma.creditHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get current credit balance
   */
  static async getCreditBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, planType: true }
    });

    if (!user) return 0;

    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan) return 0;

    // Elite and Enterprise plans have unlimited credits
    if (!plan.credits.enabled) {
      return Infinity;
    }

    return user.credits;
  }
} 