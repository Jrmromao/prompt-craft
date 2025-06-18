import { AuditAction } from '@/app/constants/audit';
import { prisma } from '@/lib/prisma';
import { UsageTrackingService } from '@/lib/services/usage/usageTrackingService';
import { SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

interface ErrorContext {
  userId?: string;
  action?: string;
  [key: string]: any;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private usageService: UsageTrackingService;

  private constructor() {
    this.usageService = UsageTrackingService.getInstance();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async checkSubscriptionHealth(): Promise<void> {
    try {
      const unhealthySubscriptions = await prisma.subscription.findMany({
        where: {
          status: {
            in: [SubscriptionStatus.PAST_DUE, SubscriptionStatus.UNPAID, SubscriptionStatus.CANCELED],
          },
        },
        include: {
          user: true,
        },
      });

      for (const subscription of unhealthySubscriptions) {
        await prisma.auditLog.create({
          data: {
            action: 'SUBSCRIPTION_HEALTH_CHECK',
            resource: 'subscription',
            userId: subscription.userId,
            status: 'success',
            details: {
              subscriptionId: subscription.id,
              status: subscription.status,
              userId: subscription.userId,
              email: subscription.user?.email,
            },
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error checking subscription health:', error);
      throw error;
    }
  }

  public async checkUsageLimits(): Promise<void> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        user: true,
        plan: true,
      },
    });

    for (const subscription of subscriptions) {
      try {
        const [usage, limits] = await Promise.all([
          this.usageService.getUsageMetrics(subscription.userId),
          this.usageService.getUserLimits(subscription.userId),
        ]);

        // Check each feature's usage
        const features = ['prompts', 'tokens', 'team_members'] as const;
        for (const feature of features) {
          let usageValue = 0;
          let limitValue = 0;
          if (feature === 'prompts') {
            usageValue = usage.prompts;
            limitValue = limits.maxPrompts;
          } else if (feature === 'tokens') {
            usageValue = usage.tokens;
            limitValue = limits.maxTokens;
          } else if (feature === 'team_members') {
            usageValue = usage.team_members;
            limitValue = limits.maxTeamMembers;
          }
          const usagePercentage = (usageValue / limitValue) * 100;
          if (usagePercentage >= 80) {
            await this.sendUsageLimitWarning(
              subscription.userId,
              feature,
              usagePercentage
            );
          }
        }
      } catch (error) {
        console.error(
          `Error checking usage limits for user ${subscription.userId}:`,
          error
        );
      }
    }
  }

  private async sendPaymentFailureAlert(userId: string): Promise<void> {
    // TODO: Implement notification system
    console.log(`Payment failure alert sent to user ${userId}`);
  }

  private async sendUsageLimitWarning(
    userId: string,
    feature: string,
    usagePercentage: number
  ): Promise<void> {
    // TODO: Implement notification system
    console.log(
      `Usage limit warning sent to user ${userId} for ${feature} (${usagePercentage.toFixed(1)}%)`
    );
  }

  public async getSystemStatus(): Promise<{
    activeSubscriptions: number;
    pastDueSubscriptions: number;
    totalUsers: number;
    recentErrors: number;
  }> {
    const [
      activeSubscriptions,
      pastDueSubscriptions,
      totalUsers,
      recentErrors,
    ] = await Promise.all([
      prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.PAST_DUE },
      }),
      prisma.user.count(),
      prisma.auditLog.count({
        where: {
          action: 'ERROR',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      activeSubscriptions,
      pastDueSubscriptions,
      totalUsers,
      recentErrors,
    };
  }

  public async logError(error: Error, context: ErrorContext = {}): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: AuditAction.ERROR,
          resource: context.action || 'system',
          userId: context.userId ?? null,
          status: 'failure',
          details: {
            message: error.message,
            stack: error.stack,
            ...context,
          },
          timestamp: new Date(),
        },
      });
    } catch (dbError) {
      console.error('Error logging error to database:', dbError);
      throw dbError;
    }
  }
} 