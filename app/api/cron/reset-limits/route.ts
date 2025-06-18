import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { MonthlyCreditResetService } from '@/lib/services/monthlyCreditResetService';

// This route should be called by a cron job at the beginning of each month
export async function POST(req: Request) {
  try {
    // Verify the request is from a trusted source (e.g., Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all free users who need a reset
    const freeUsers = await prisma.user.findMany({
      where: {
        planType: PlanType.FREE,
        OR: [
          { lastCreditReset: { lt: new Date(new Date().setDate(1)) } }, // Before this month
          { lastCreditReset: null }
        ]
      },
      select: {
        id: true
      }
    });

    // Get the MonthlyCreditResetService instance
    const monthlyResetService = MonthlyCreditResetService.getInstance();

    let success = 0;
    let failed = 0;
    const errors = [];

    // Reset credits for each free user
    for (const user of freeUsers) {
      try {
        await monthlyResetService.resetMonthlyCredits(user.id);
        success++;
      } catch (error) {
        failed++;
        errors.push({ userId: user.id, error });
      }
    }

    // Log the results
    await AuditService.getInstance().logAudit({
      userId: 'system',
      action: AuditAction.MONTHLY_CREDIT_RESET,
      resource: 'credits',
      details: {
        type: 'monthly_credit_reset',
        userType: 'free',
        successCount: success,
        failedCount: failed,
        errors: JSON.stringify(errors)
      }
    });

    return NextResponse.json({
      success: true,
      message: `Reset monthly credits for ${success} free users (${failed} failed)`,
      timestamp: new Date().toISOString(),
      details: {
        success,
        failed,
        errors
      }
    });
  } catch (error) {
    console.error('Error resetting monthly credits for free users:', error);
    return NextResponse.json(
      { error: 'Failed to reset monthly credits for free users' },
      { status: 500 }
    );
  }
} 