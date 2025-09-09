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
  missingCredits: number;
  creditCap: number;
  planType: PlanType;
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

  private static readonly CREDIT_CAPS = {
    FREE: 100,
    PRO: 1000,
    ELITE: 5000,
    ENTERPRISE: 10000
  };

  private static readonly MONTHLY_CREDIT_ALLOCATIONS = {
    FREE: 50,
    PRO: 500,
    ELITE: 2500,
    ENTERPRISE: 5000
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

  public async deductCredits(userId: string, amount: number, type: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let remainingAmount = amount;
    let monthlyCreditsUsed = 0;
    let purchasedCreditsUsed = 0;

    // Use monthly credits first
    if (user.monthlyCredits > 0 && remainingAmount > 0) {
      monthlyCreditsUsed = Math.min(user.monthlyCredits, remainingAmount);
      remainingAmount -= monthlyCreditsUsed;
    }

    // Then use purchased credits
    if (user.purchasedCredits > 0 && remainingAmount > 0) {
      purchasedCreditsUsed = Math.min(user.purchasedCredits, remainingAmount);
      remainingAmount -= purchasedCreditsUsed;
    }

    if (remainingAmount > 0) {
      throw new Error('Insufficient credits');
    }

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyCredits: user.monthlyCredits - monthlyCreditsUsed,
        purchasedCredits: user.purchasedCredits - purchasedCreditsUsed
      }
    });

    // Log credit usage
    await prisma.creditHistory.create({
      data: {
        userId,
        amount: -amount,
        type: type as CreditType,
        description: `Credits used for ${type.toLowerCase().replace('_', ' ')}`
      }
    });

    // Log audit trail
    const auditService = AuditService.getInstance();
    await auditService.logAction({
      userId,
      action: AuditAction.CREDITS_DEDUCTED,
      details: {
        amount,
        type,
        monthlyCreditsUsed,
        purchasedCreditsUsed
      }
    });
  }

  public async checkCreditBalance(userId: string, requiredCredits: number): Promise<CreditCheck> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
        creditCap: true,
        planType: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const totalCredits = user.monthlyCredits + user.purchasedCredits;
    const hasEnoughCredits = totalCredits >= requiredCredits;
    const missingCredits = hasEnoughCredits ? 0 : requiredCredits - totalCredits;

    return {
      hasEnoughCredits,
      monthlyCredits: user.monthlyCredits,
      purchasedCredits: user.purchasedCredits,
      missingCredits,
      creditCap: user.creditCap,
      planType: user.planType as PlanType
    };
  }

  public async resetMonthlyCredits(userId: string): Promise<CreditReset> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const monthlyAllocation = CreditService.MONTHLY_CREDIT_ALLOCATIONS[user.planType];

    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyCredits: monthlyAllocation,
        lastCreditReset: new Date()
      }
    });

    // Log the credit reset
    await prisma.creditHistory.create({
      data: {
        userId,
        amount: monthlyAllocation,
        type: 'SUBSCRIPTION',
        description: 'Monthly credit reset'
      }
    });

    return {
      newBalance: monthlyAllocation,
      resetDate: new Date(),
      periodType: Period.MONTHLY
    };
  }

  public async deductCredits(userId: string, amount: number, type: CreditType = 'USAGE', description?: string): Promise<boolean> {
    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: {
            monthlyCredits: true,
            purchasedCredits: true,
            creditCap: true
          }
        });

        if (!user) {
          throw new Error('User not found');
        }

        let remainingToDeduct = amount;
        let monthlyCreditsDeducted = 0;
        let purchasedCreditsDeducted = 0;

        // First deduct from monthly credits
        if (user.monthlyCredits > 0) {
          monthlyCreditsDeducted = Math.min(user.monthlyCredits, remainingToDeduct);
          remainingToDeduct -= monthlyCreditsDeducted;
        }

        // Then deduct from purchased credits if needed
        if (remainingToDeduct > 0 && user.purchasedCredits > 0) {
          purchasedCreditsDeducted = Math.min(user.purchasedCredits, remainingToDeduct);
          remainingToDeduct -= purchasedCreditsDeducted;
        }

        if (remainingToDeduct > 0) {
          throw new Error('Insufficient credits');
        }

        // Update user credits
        await tx.user.update({
          where: { id: userId },
          data: {
            monthlyCredits: user.monthlyCredits - monthlyCreditsDeducted,
            purchasedCredits: user.purchasedCredits - purchasedCreditsDeducted
          }
        });

        // Log the credit deduction
        if (monthlyCreditsDeducted > 0) {
          await tx.creditHistory.create({
            data: {
              userId,
              amount: -monthlyCreditsDeducted,
              type: 'USAGE',
              description: description || 'Monthly credits used'
            }
          });
        }

        if (purchasedCreditsDeducted > 0) {
          await tx.creditHistory.create({
            data: {
              userId,
              amount: -purchasedCreditsDeducted,
              type: 'USAGE',
              description: description || 'Purchased credits used'
            }
          });
        }

        return true;
      });
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  }

  public async addCredits(userId: string, amount: number, type: CreditType): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
        creditCap: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentTotal = user.monthlyCredits + user.purchasedCredits;
    const newTotal = currentTotal + amount;

    if (newTotal > user.creditCap) {
      throw new Error('Credit cap exceeded');
    }

    // Add credits based on type
    if (type === 'SUBSCRIPTION') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyCredits: user.monthlyCredits + amount
        }
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          purchasedCredits: user.purchasedCredits + amount
        }
      });
    }

    // Log the credit addition
    await prisma.creditHistory.create({
      data: {
        userId,
        amount,
        type,
        description: `${type.toLowerCase()} credits added`
      }
    });
  }

  public async getCreditUsage(userId: string): Promise<{
    used: number;
    total: number;
    percentage: number;
    nextResetDate: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
        lastCreditReset: true,
        planType: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const monthlyAllocation = CreditService.MONTHLY_CREDIT_ALLOCATIONS[user.planType];
    const used = monthlyAllocation - user.monthlyCredits;
    const total = monthlyAllocation;
    const percentage = (used / total) * 100;

    // Calculate next reset date (first day of next month)
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    nextResetDate.setDate(1);
    nextResetDate.setHours(0, 0, 0, 0);

    return {
      used,
      total,
      percentage,
      nextResetDate
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
