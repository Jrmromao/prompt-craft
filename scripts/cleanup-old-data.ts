import { prisma } from '../lib/prisma';

/**
 * Data Retention Policy Cleanup
 * Run daily via cron: 0 2 * * * (2 AM daily)
 */

async function cleanupOldData() {
  const now = new Date();
  
  console.log('🧹 Starting data cleanup...');

  // 1. Delete usage logs older than 90 days
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const deletedRuns = await prisma.promptRun.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
    },
  });
  console.log(`✅ Deleted ${deletedRuns.count} prompt runs older than 90 days`);

  // 2. Delete audit logs older than 1 year
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const deletedAudits = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: oneYearAgo },
    },
  });
  console.log(`✅ Deleted ${deletedAudits.count} audit logs older than 1 year`);

  // 3. Delete quality feedback older than 90 days
  const deletedFeedback = await prisma.qualityFeedback.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
    },
  });
  console.log(`✅ Deleted ${deletedFeedback.count} quality feedback older than 90 days`);

  // 4. Hard delete users marked for deletion > 30 days ago
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const usersToDelete = await prisma.user.findMany({
    where: {
      deletedAt: {
        not: null,
        lt: thirtyDaysAgo,
      },
    },
  });

  for (const user of usersToDelete) {
    // Delete all user data
    await prisma.promptRun.deleteMany({ where: { userId: user.id } });
    await prisma.apiKey.deleteMany({ where: { userId: user.id } });
    await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    await prisma.qualityFeedback.deleteMany({ where: { userId: user.id } });
    await prisma.userConsent.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    
    console.log(`✅ Hard deleted user ${user.id} and all associated data`);
  }

  console.log('✨ Cleanup complete!');
}

// Run cleanup
cleanupOldData()
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
