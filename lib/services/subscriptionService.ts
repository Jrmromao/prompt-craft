import { prisma } from '@/lib/prisma';
import { Role, PlanType, Period, SubscriptionStatus } from '@/utils/constants';
import { addDays, addMonths, isAfter } from 'date-fns';

interface SubscriptionDetails {
  status: SubscriptionStatus;
  tier: PlanType;
  period: Period;
  periodEnd: Date;
  autoRenew: boolean;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private readonly PRICING = {
    [PlanType.LITE]: {
      weekly: 3,
      monthly: 12,
    },
    [PlanType.PRO]: {
      monthly: 12,
    },
  };

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async getSubscriptionDetails(userId: string): Promise<SubscriptionDetails> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: {
          select: {
            status: true,
            tier: true,
            period: true,
            periodEnd: true,
            autoRenew: true,
          },
        },
      },
    });

    if (!user?.subscription) {
      return {
        status: SubscriptionStatus.INCOMPLETE,
        tier: PlanType.FREE,
        period: Period.WEEKLY,
        periodEnd: new Date(),
        autoRenew: false,
      };
    }

    return user.subscription as SubscriptionDetails;
  }

  public async createSubscription(
    userId: string,
    tier: PlanType,
    period: Period,
    autoRenew: boolean = true
  ): Promise<SubscriptionDetails> {
    const now = new Date();
    const periodEnd = period === Period.WEEKLY
      ? addDays(now, 7)
      : addMonths(now, 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier,
        period,
        status: SubscriptionStatus.ACTIVE,
        periodEnd,
        autoRenew,
      },
    });

    // Update user role based on subscription tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: tier === PlanType.PRO ? Role.PRO : Role.LITE,
      },
    });

    return subscription as SubscriptionDetails;
  }

  public async cancelSubscription(userId: string): Promise<SubscriptionDetails> {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
        autoRenew: false,
      },
    });

    // Update user role to FREE after cancellation
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: Role.FREE,
      },
    });

    return subscription as SubscriptionDetails;
  }

  public async updateSubscription(
    userId: string,
    updates: Partial<SubscriptionDetails>
  ): Promise<SubscriptionDetails> {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: updates,
    });

    // Update user role if tier changes
    if (updates.tier) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: updates.tier === PlanType.PRO ? Role.PRO : Role.LITE,
        },
      });
    }

    return subscription as SubscriptionDetails;
  }

  public async checkSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    daysRemaining: number;
    needsRenewal: boolean;
  }> {
    const subscription = await this.getSubscriptionDetails(userId);
    const now = new Date();

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return {
        isActive: false,
        daysRemaining: 0,
        needsRenewal: true,
      };
    }

    const daysRemaining = Math.ceil(
      (subscription.periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isActive: true,
      daysRemaining,
      needsRenewal: daysRemaining <= 3 && !subscription.autoRenew,
    };
  }

  public async processRenewal(userId: string): Promise<SubscriptionDetails> {
    const subscription = await this.getSubscriptionDetails(userId);
    const now = new Date();

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('Subscription is not active');
    }

    if (!isAfter(subscription.periodEnd, now)) {
      // Calculate new period end
      const newPeriodEnd = subscription.period === Period.WEEKLY
        ? addDays(now, 7)
        : addMonths(now, 1);

      // Update subscription
      return this.updateSubscription(userId, {
        periodEnd: newPeriodEnd,
        status: SubscriptionStatus.ACTIVE,
      });
    }

    return subscription;
  }

  public getPricing(tier: PlanType, period: Period): number {
    return this.PRICING[tier][period] || 0;
  }
} 