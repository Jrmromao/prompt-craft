import { prisma } from '@/lib/prisma';

export class UsageService {
  private static instance: UsageService;

  private constructor() {}

  public static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService();
    }
    return UsageService.instance;
  }

  public async getUserUsage(userId: string) {
    try {
      // Get user's subscription period
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });

      if (!user?.subscription) {
        throw new Error('No active subscription found');
      }

      const { currentPeriodStart, currentPeriodEnd } = user.subscription;

      // Get usage data for the current period
      const usage = await prisma.usage.findMany({
        where: {
          userId,
          timestamp: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Format the usage data
      const recentActivity = usage.map(record => ({
        date: record.timestamp.toISOString(),
        description: `Used ${record.feature}`,
        amount: record.count,
        type: record.feature,
      }));

      // Get daily usage for the chart
      const dailyUsage = await prisma.usage.groupBy({
        by: ['timestamp'],
        where: {
          userId,
          timestamp: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd,
          },
        },
        _sum: {
          count: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      const formattedDailyUsage = dailyUsage.map(day => ({
        date: day.timestamp.toISOString(),
        used: day._sum.count || 0,
      }));

      return {
        totalCreditsUsed: usage.reduce((sum, record) => sum + record.count, 0),
        creditsRemaining: user.creditCap - usage.reduce((sum, record) => sum + record.count, 0),
        creditCap: user.creditCap,
        lastCreditReset: currentPeriodStart.toISOString(),
        totalRequests: usage.length,
        dailyUsage: formattedDailyUsage,
        recentActivity,
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      throw error;
    }
  }
}
