import { prisma } from '@/lib/prisma';
import { Role, CreditType, Period, PlanType } from '@/utils/constants';
import { addDays, addMonths, isAfter, isBefore } from 'date-fns';
import { EmailService } from './emailService';

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
    [PlanType.FREE]: 10,
    [PlanType.LITE]: 1500,
    [PlanType.PRO]: 5000,
  };

  private readonly CREDIT_ALLOCATIONS = {
    [PlanType.FREE]: 10,
    [PlanType.LITE]: 250,
    [PlanType.PRO]: 1500,
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
            cancelAtPeriodEnd: true,
            currentPeriodStart: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const creditCap = this.CREDIT_CAPS[user.role as PlanType];
    const currentCredits = user.credits;
    const missingCredits = Math.max(0, requiredCredits - currentCredits);

    return {
      hasEnoughCredits: currentCredits >= requiredCredits,
      currentCredits,
      requiredCredits,
      missingCredits,
      creditCap,
      periodEnd: user.subscription?.currentPeriodStart || undefined,
    };
  }

  public async resetCredits(userId: string): Promise<CreditReset> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        email: true,
        name: true,
        emailPreferences: true,
        subscription: {
          select: {
            currentPeriodEnd: true,
            currentPeriodStart: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const role = user.role as PlanType;
    const currentPeriodEnd = user.subscription?.currentPeriodEnd || new Date();

    // Calculate next period end (example: weekly)
    const nextPeriodEnd = addDays(currentPeriodEnd, 7);

    // Calculate new credit balance
    const newBalance = this.CREDIT_ALLOCATIONS[role];

    // Update user credits and subscription period end
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
        subscription: {
          update: {
            currentPeriodEnd: nextPeriodEnd,
          },
        },
      },
    });

    // Record credit reset transaction
    await prisma.creditHistory.create({
      data: {
        userId,
        amount: newBalance,
        type: CreditType.SUBSCRIPTION,
        description: `credit reset`,
      },
    });

    // Send credit update email if user has product updates enabled
    const emailPreferences = typeof user.emailPreferences === 'string'
      ? JSON.parse(user.emailPreferences)
      : user.emailPreferences;

    if (emailPreferences?.productUpdates) {
      const emailService = EmailService.getInstance();
      await emailService.sendCreditUpdate(
        user.email,
        user.name || 'there',
        newBalance,
        'Weekly credit reset'
      );
    }

    return {
      newBalance,
      resetDate: nextPeriodEnd,
      periodType: Period.WEEKLY,
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

    const creditCap = this.CREDIT_CAPS[user.role as PlanType];
    const newBalance = Math.min(user.credits + amount, creditCap);

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
      },
    });

    // Record credit transaction
    await prisma.creditHistory.create({
      data: {
        userId,
        amount: amount,
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
    await prisma.creditHistory.create({
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
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const total = this.CREDIT_ALLOCATIONS[user.role as PlanType];
    const used = total - user.credits;
    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage,
      periodEnd: user.subscription?.currentPeriodEnd || new Date(),
    };
  }
}
