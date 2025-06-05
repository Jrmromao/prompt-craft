import { prisma } from '@/lib/prisma';
import { Role } from '@/utils/constants';
import { SubscriptionStatus, PlanType, Period } from '@prisma/client';
import { addDays, addMonths, isAfter } from 'date-fns';

interface SubscriptionDetails {
  status: SubscriptionStatus;
  planName: string;
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
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user?.subscription || !user.subscription.plan) {
      return {
        status: SubscriptionStatus.INCOMPLETE,
        planName: 'FREE',
        period: Period.MONTHLY,
        periodEnd: new Date(),
        autoRenew: false,
      };
    }

    const sub = user.subscription;
    return {
      status: sub.status,
      planName: sub.plan.name,
      period: sub.plan.period,
      periodEnd: sub.currentPeriodEnd,
      autoRenew: !sub.cancelAtPeriodEnd,
    };
  }

  public async createSubscription(
    userId: string,
    planId: string,
    autoRenew: boolean = true
  ): Promise<SubscriptionDetails> {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');
    const now = new Date();
    const periodEnd = plan.period === Period.WEEKLY
      ? addDays(now, 7)
      : addMonths(now, 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: !autoRenew,
        stripeCustomerId: '', // set as needed
        stripeSubscriptionId: '', // set as needed
      },
      include: { plan: true },
    });

    // Update user role based on plan
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     role: subscription.plan.name === 'PRO' ? Role.ADMIN : Role.USER,
    //   },
    // });

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      period: subscription.plan.period,
      periodEnd: subscription.currentPeriodEnd,
      autoRenew: !subscription.cancelAtPeriodEnd,
    };
  }

  public async cancelSubscription(userId: string): Promise<SubscriptionDetails> {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: true,
      },
      include: { plan: true },
    });

    // Update user role to FREE after cancellation
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: PlanType.FREE,
      },
    });

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      period: subscription.plan.period,
      periodEnd: subscription.currentPeriodEnd,
      autoRenew: !subscription.cancelAtPeriodEnd,
    };
  }

  public async updateSubscription(
    userId: string,
    updates: Partial<{ planId: string; status: SubscriptionStatus; currentPeriodEnd: Date; cancelAtPeriodEnd: boolean; }>
  ): Promise<SubscriptionDetails> {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: updates,
      include: { plan: true },
    });

    // Update user role if plan changes
    if (updates.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: updates.planId } });
      if (plan) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: plan.name === 'PRO' ? Role.ADMIN : Role.USER,
          },
        });
      }
    }

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      period: subscription.plan.period,
      periodEnd: subscription.currentPeriodEnd,
      autoRenew: !subscription.cancelAtPeriodEnd,
    };
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
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!subscription) throw new Error('Subscription not found');
    const now = new Date();

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('Subscription is not active');
    }

    if (!isAfter(subscription.currentPeriodEnd, now)) {
      // Calculate new period end
      const newPeriodEnd = subscription.plan.period === Period.WEEKLY
        ? addDays(now, 7)
        : addMonths(now, 1);

      // Update subscription
      return this.updateSubscription(userId, {
        currentPeriodEnd: newPeriodEnd,
        status: SubscriptionStatus.ACTIVE,
      });
    }

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      period: subscription.plan.period,
      periodEnd: subscription.currentPeriodEnd,
      autoRenew: !subscription.cancelAtPeriodEnd,
    };
  }

  public getPricing(planName: PlanType, period: Period): number {
    // Find the plan by name and period
    if (planName === PlanType.LITE) {
      return period === Period.WEEKLY ? this.PRICING[PlanType.LITE].weekly : this.PRICING[PlanType.LITE].monthly;
    }
    if (planName === PlanType.PRO) {
      return this.PRICING[PlanType.PRO].monthly;
    }
    return 0;
  }
} 