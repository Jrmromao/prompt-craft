import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

/**
 * Cleanup old prompt runs based on user's plan data retention limits
 * Run this daily via cron job
 */
export async function cleanupOldRuns() {
  console.log('Starting data retention cleanup...');

  const users = await prisma.user.findMany({
    select: { id: true, planType: true },
  });

  let totalDeleted = 0;

  for (const user of users) {
    const plan = PLANS[user.planType as keyof typeof PLANS] || PLANS.FREE;
    const retentionDays = plan.limits.dataRetention;

    if (retentionDays === -1) continue; // Unlimited retention

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleted = await prisma.promptRun.deleteMany({
      where: {
        userId: user.id,
        createdAt: { lt: cutoffDate },
      },
    });

    totalDeleted += deleted.count;
  }

  console.log(`Cleanup complete. Deleted ${totalDeleted} old runs.`);
  return totalDeleted;
}

// API route handler
export async function GET() {
  try {
    const deleted = await cleanupOldRuns();
    return Response.json({ success: true, deleted });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return Response.json({ success: false, error: 'Cleanup failed' }, { status: 500 });
  }
}
