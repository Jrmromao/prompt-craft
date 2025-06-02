import { prisma } from '@/lib/prisma';
import { Role, CreditType, Period } from '@/utils/constants';
import { addDays, addMonths, isAfter, isBefore } from 'date-fns';

interface CreditCheck {
  hasEnoughCredits: boolean;
  currentCredits: number;
  requiredCredits: number;
  missingCredits: number;
  creditCap: number;
  periodEnd?: Date;
}

interface CreditReset {
  newBalance: number;
  resetDate: Date;
  periodType: Period;
}

export class CreditService {
  private static instance: CreditService;
  private readonly CREDIT_CAPS = {
    [Role.FREE]: 10,
    [Role.LITE]: 1500,
    [Role.PRO]: 5000,
  };

  private readonly CREDIT_ALLOCATIONS = {
    [Role.FREE]: 10,
    [Role.LITE]: 250,
    [Role.PRO]: 1500,
  };

  private constructor() {}

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  public async checkCreditBalance(userId: string, requiredCredits: number): Promise<CreditCheck> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        role: true,
        subscription: {
          select: {
            periodEnd: true,
            period: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const creditCap = this.CREDIT_CAPS[user.role as Role];
    const currentCredits = user.credits;
    const missingCredits = Math.max(0, requiredCredits - currentCredits);

    return {
      hasEnoughCredits: currentCredits >= requiredCredits,
      currentCredits,
      requiredCredits,
      missingCredits,
      creditCap,
      periodEnd: user.subscription?.periodEnd || undefined,
    };
  }

  public async resetCredits(userId: string): Promise<CreditReset> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        subscription: {
          select: {
            period: true,
            periodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const role = user.role as Role;
    const period = user.subscription?.period || Period.WEEKLY;
    const currentPeriodEnd = user.subscription?.periodEnd || new Date();

    // Calculate next period end
    const nextPeriodEnd = period === Period.WEEKLY
      ? addDays(currentPeriodEnd, 7)
      : addMonths(currentPeriodEnd, 1);

    // Calculate new credit balance
    const newBalance = this.CREDIT_ALLOCATIONS[role];

    // Update user credits and period end
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
        subscription: {
          update: {
            periodEnd: nextPeriodEnd,
          },
        },
      },
    });

    // Record credit reset transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: newBalance,
        type: CreditType.SUBSCRIPTION,
        description: `${period} credit reset`,
      },
    });

    return {
      newBalance,
      resetDate: nextPeriodEnd,
      periodType: period as Period,
    };
  }

  public async addCredits(
    userId: string,
    amount: number,
    type: CreditType,
    description?: string
  ): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const creditCap = this.CREDIT_CAPS[user.role as Role];
    const newBalance = Math.min(user.credits + amount, creditCap);

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
      },
    });

    // Record credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        description: description || `${type} credit addition`,
      },
    });

    return newBalance;
  }

  public async deductCredits(
    userId: string,
    amount: number,
    type: CreditType = CreditType.USAGE,
    description?: string
  ): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    const newBalance = user.credits - amount;

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
      },
    });

    // Record credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description: description || `${type} credit deduction`,
      },
    });

    return newBalance;
  }

  public async getCreditUsage(userId: string): Promise<{
    used: number;
    total: number;
    percentage: number;
    periodEnd: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        role: true,
        subscription: {
          select: {
            periodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const total = this.CREDIT_ALLOCATIONS[user.role as Role];
    const used = total - user.credits;
    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage,
      periodEnd: user.subscription?.periodEnd || new Date(),
    };
  }
} 