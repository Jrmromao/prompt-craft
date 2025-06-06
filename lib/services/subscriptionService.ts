import { prisma } from '@/lib/prisma';
import { Role } from '@/utils/constants';
import { SubscriptionStatus, PlanType, Period, Subscription, Plan } from '@prisma/client';
import { addDays, addMonths, isAfter } from 'date-fns';
import { DatabaseService } from '@/lib/services/database/databaseService';

interface SubscriptionDetails {
  status: SubscriptionStatus;
  planName: string;
  period: Period;
  periodEnd: Date;
  autoRenew: boolean;
}

interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private databaseService: DatabaseService;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async getSubscriptionDetails(userId: string): Promise<SubscriptionDetails> {
    const subscription = (await this.databaseService.getSubscriptionWithCache(
      userId
    )) as SubscriptionWithPlan | null;

    if (!subscription || !subscription.plan) {
      return {
        status: SubscriptionStatus.INCOMPLETE,
        planName: 'FREE',
        period: Period.MONTHLY,
        periodEnd: new Date(),
        autoRenew: false,
      };
    }

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      period: subscription.plan.period,
      periodEnd: subscription.currentPeriodEnd,
      autoRenew: !subscription.cancelAtPeriodEnd,
    };
  }

  public async createSubscription(
    userId: string,
    planId: string,
    autoRenew: boolean = true
  ): Promise<SubscriptionDetails> {
    const plan = (await this.databaseService.getPlanWithCache(planId)) as Plan | null;
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const periodEnd = plan.period === Period.WEEKLY ? addDays(now, 7) : addMonths(now, 1);

    const subscription = (await this.databaseService.createSubscription({
      user: { connect: { id: userId } },
      plan: { connect: { id: planId } },
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: !autoRenew,
      stripeCustomerId: '', // set as needed
      stripeSubscriptionId: '', // set as needed
    })) as SubscriptionWithPlan;

    return {
      status: subscription.status,
      planName: subscription.plan.name,
      period: subscription.plan.period,
      periodEnd: subscription.currentPeriodEnd,
      autoRenew: !subscription.cancelAtPeriodEnd,
    };
  }

  public async cancelSubscription(userId: string): Promise<SubscriptionDetails> {
    const subscription = (await this.databaseService.updateSubscription(userId, {
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd: true,
    })) as SubscriptionWithPlan;

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
    updates: Partial<{
      planId: string;
      status: SubscriptionStatus;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
    }>
  ): Promise<SubscriptionDetails> {
    const subscription = (await this.databaseService.updateSubscription(
      userId,
      updates
    )) as SubscriptionWithPlan;

    // Update user role if plan changes
    if (updates.planId) {
      const plan = (await this.databaseService.getPlanWithCache(updates.planId)) as Plan | null;
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
      const newPeriodEnd =
        subscription.plan.period === Period.WEEKLY ? addDays(now, 7) : addMonths(now, 1);

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

  public async getPricing(planName: PlanType, period: Period): Promise<number> {
    const plan = (await this.databaseService.getPlanWithCache(planName)) as Plan | null;
    if (!plan) {
      throw new Error(`Plan ${planName} not found`);
    }

    // Only return price if the plan's period matches the requested period
    if (plan.period === period) {
      return plan.price;
    }

    throw new Error(`Plan ${planName} is not available for ${period} period`);
  }
}
