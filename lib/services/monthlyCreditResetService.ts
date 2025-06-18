import { prisma } from '@/lib/prisma';
import { CreditService } from './creditService';
import { startOfMonth, isBefore } from 'date-fns';

export class MonthlyCreditResetService {
  private static instance: MonthlyCreditResetService;
  private creditService: CreditService;

  private constructor() {
    this.creditService = CreditService.getInstance();
  }

  public static getInstance(): MonthlyCreditResetService {
    if (!MonthlyCreditResetService.instance) {
      MonthlyCreditResetService.instance = new MonthlyCreditResetService();
    }
    return MonthlyCreditResetService.instance;
  }

  /**
   * Resets monthly credits for a single user
   */
  public async resetMonthlyCredits(userId: string): Promise<void> {
    await this.creditService.resetMonthlyCredits(userId);
  }

  /**
   * Resets monthly credits for all users who haven't been reset this month.
   */
  public async resetAllEligibleUsers(): Promise<{ success: number; failed: number; errors: any[] }> {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { lastCreditReset: { lt: thisMonthStart } },
          { lastCreditReset: null },
        ],
      },
      select: { id: true },
    });

    let success = 0;
    let failed = 0;
    const errors = [];

    for (const user of users) {
      try {
        await this.creditService.resetMonthlyCredits(user.id);
        success++;
      } catch (error) {
        failed++;
        errors.push({ userId: user.id, error });
      }
    }

    return { success, failed, errors };
  }
} 