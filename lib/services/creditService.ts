import { prisma } from '@/lib/prisma';
import { Role, Period, PlanType } from '@/utils/constants';
import { CreditType } from '@prisma/client';
import { addDays, addMonths, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { EmailService } from './emailService';
import { PlanService } from './planService';
import { ServiceError } from './types';
import { AuditService } from './auditService';
import { AuditAction } from '@/app/constants/audit';

interface CreditCheck {
  hasEnoughCredits: boolean;
  monthlyCredits: number;
  purchasedCredits: number;
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
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private userCache: Map<string, { user: any; timestamp: number }> = new Map();

  private readonly CREDIT_CAPS = {
    [PlanType.FREE]: 10,
    [PlanType.PRO]: 5000,
    [PlanType.ELITE]: Infinity,
    [PlanType.ENTERPRISE]: Infinity,
  };

  private readonly MONTHLY_CREDIT_ALLOCATIONS = {
    [PlanType.FREE]: 10,
    [PlanType.PRO]: 1500,
    [PlanType.ELITE]: Infinity,
    [PlanType.ENTERPRISE]: Infinity,
  };

  private readonly TOKEN_COST_RATES = {
    'gpt-4': 0.03, // $0.03 per 1K tokens
    'gpt-3.5-turbo': 0.002, // $0.002 per 1K tokens
  } as const;

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
        monthlyCredits: true,
        purchasedCredits: true,
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
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const hasUnlimitedCredits = await PlanService.hasUnlimitedCredits(userId);
    if (hasUnlimitedCredits) {
      return {
        hasEnoughCredits: true,
        monthlyCredits: Infinity,
        purchasedCredits: Infinity,
        requiredCredits,
        missingCredits: 0,
        creditCap: Infinity,
        periodEnd: user.subscription?.currentPeriodStart || undefined,
      };
    }

    const creditCap = this.CREDIT_CAPS[user.role as PlanType];
    const totalCredits = user.monthlyCredits + user.purchasedCredits;
    const missingCredits = Math.max(0, requiredCredits - totalCredits);

    return {
      hasEnoughCredits: totalCredits >= requiredCredits,
      monthlyCredits: user.monthlyCredits,
      purchasedCredits: user.purchasedCredits,
      requiredCredits,
      missingCredits,
      creditCap,
      periodEnd: user.subscription?.currentPeriodStart || undefined,
    };
  }

  public async resetMonthlyCredits(userId: string): Promise<CreditReset> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        email: true,
        name: true,
        emailPreferences: true,
        lastMonthlyReset: true,
      },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const hasUnlimitedCredits = await PlanService.hasUnlimitedCredits(userId);
    if (hasUnlimitedCredits) {
      return {
        newBalance: Infinity,
        resetDate: addMonths(new Date(), 1),
        periodType: Period.MONTHLY,
      };
    }

    const role = user.role as PlanType;
    const now = new Date();
    const nextMonth = addMonths(now, 1);
    const nextMonthStart = startOfMonth(nextMonth);

    // Calculate new credit balance
    const newBalance = this.MONTHLY_CREDIT_ALLOCATIONS[role];

    // Update user monthly credits and reset date
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyCredits: newBalance,
        lastMonthlyReset: now,
      },
    });

    // Record credit reset transaction
    await prisma.creditHistory.create({
      data: {
        userId,
        amount: newBalance,
        type: CreditType.SUBSCRIPTION,
        description: 'Monthly credit reset',
      },
    });

    // Send credit update email if user has product updates enabled
    const emailPreferences =
      typeof user.emailPreferences === 'string'
        ? JSON.parse(user.emailPreferences)
        : user.emailPreferences;

    if (emailPreferences?.productUpdates) {
      const emailService = EmailService.getInstance();
      await emailService.sendCreditUpdate(
        user.email,
        user.name || 'there',
        newBalance,
        'Monthly credit reset'
      );
    }

    return {
      newBalance,
      resetDate: nextMonthStart,
      periodType: Period.MONTHLY,
    };
  }

  public async deductCredits(
    userId: string,
    amount: number,
    type: CreditType = CreditType.USAGE,
    description?: string
  ): Promise<number> {
    const hasUnlimitedCredits = await PlanService.hasUnlimitedCredits(userId);
    if (hasUnlimitedCredits) {
      return Infinity;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
      },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    // First try to deduct from monthly credits, then from purchased credits
    let remainingAmount = amount;
    let newMonthlyCredits = user.monthlyCredits;
    let newPurchasedCredits = user.purchasedCredits;

    if (user.monthlyCredits > 0) {
      const monthlyDeduction = Math.min(user.monthlyCredits, remainingAmount);
      newMonthlyCredits -= monthlyDeduction;
      remainingAmount -= monthlyDeduction;
    }

    if (remainingAmount > 0 && user.purchasedCredits > 0) {
      const purchasedDeduction = Math.min(user.purchasedCredits, remainingAmount);
      newPurchasedCredits -= purchasedDeduction;
      remainingAmount -= purchasedDeduction;
    }

    if (remainingAmount > 0) {
      throw new ServiceError('Insufficient credits', 'INSUFFICIENT_CREDITS');
    }

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyCredits: newMonthlyCredits,
        purchasedCredits: newPurchasedCredits,
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

    // Log the credit deduction
    await AuditService.getInstance().logAudit({
      userId,
      action: AuditAction.CREDITS_DEDUCTED,
      resource: 'credits',
      details: {
        amount,
        description,
        remainingBalance: newMonthlyCredits + newPurchasedCredits,
      },
    });

    return newMonthlyCredits + newPurchasedCredits;
  }

  public async addCredits(
    userId: string,
    amount: number,
    type: CreditType = CreditType.TOP_UP,
    description?: string
  ): Promise<number> {
    const hasUnlimitedCredits = await PlanService.hasUnlimitedCredits(userId);
    if (hasUnlimitedCredits) {
      return Infinity;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
      },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const newMonthlyCredits = user.monthlyCredits;
    const newPurchasedCredits = user.purchasedCredits + amount;

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyCredits: newMonthlyCredits,
        purchasedCredits: newPurchasedCredits,
      },
    });

    // Record credit transaction
    await prisma.creditHistory.create({
      data: {
        userId,
        amount,
        type,
        description: description || `${type} credit addition`,
      },
    });

    // Log the credit addition
    await AuditService.getInstance().logAudit({
      userId,
      action: AuditAction.CREDITS_ADDED,
      resource: 'credits',
      details: {
        amount,
        description,
        newBalance: newMonthlyCredits + newPurchasedCredits,
      },
    });

    return newMonthlyCredits + newPurchasedCredits;
  }

  public async getCreditUsage(userId: string): Promise<{
    monthlyUsed: number;
    purchasedUsed: number;
    monthlyTotal: number;
    purchasedTotal: number;
    monthlyPercentage: number;
    purchasedPercentage: number;
    periodEnd: Date;
  }> {
    const hasUnlimitedCredits = await PlanService.hasUnlimitedCredits(userId);
    if (hasUnlimitedCredits) {
      return {
        monthlyUsed: 0,
        purchasedUsed: 0,
        monthlyTotal: Infinity,
        purchasedTotal: Infinity,
        monthlyPercentage: 0,
        purchasedPercentage: 0,
        periodEnd: addMonths(new Date(), 1),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
        role: true,
        lastMonthlyReset: true,
      },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const monthlyAllocation = this.MONTHLY_CREDIT_ALLOCATIONS[user.role as PlanType];
    const monthlyUsed = monthlyAllocation - user.monthlyCredits;
    const purchasedUsed = user.purchasedCredits;

    return {
      monthlyUsed,
      purchasedUsed,
      monthlyTotal: monthlyAllocation,
      purchasedTotal: user.purchasedCredits,
      monthlyPercentage: (monthlyUsed / monthlyAllocation) * 100,
      purchasedPercentage: 0, // Purchased credits don't have a percentage since they're cumulative
      periodEnd: user.lastMonthlyReset ? addMonths(user.lastMonthlyReset, 1) : new Date(),
    };
  }

  public calculateTokenCost(inputTokens: number, outputTokens: number, model: 'gpt-4' | 'gpt-3.5-turbo'): number {
    const rate = this.TOKEN_COST_RATES[model] || this.TOKEN_COST_RATES['gpt-3.5-turbo'];
    const totalTokens = inputTokens + outputTokens;
    return Math.ceil((totalTokens / 1000) * rate);
  }

  public async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const check = await this.checkCreditBalance(userId, requiredCredits);
    return check.hasEnoughCredits;
  }
}
