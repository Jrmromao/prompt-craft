import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Data Subject Requests
  const accessRequests = await prisma.dataExportRequest.count({
    where: { requestedAt: { gte: ninetyDaysAgo } }
  });

  const rectificationRequests = await prisma.dataRectificationRequest.count({
    where: { requestedAt: { gte: ninetyDaysAgo } }
  });

  const erasureRequests = await prisma.user.count({
    where: { 
      deletedAt: { gte: ninetyDaysAgo },
      NOT: { deletedAt: null }
    }
  });

  const completedRequests = await prisma.dataExportRequest.findMany({
    where: {
      requestedAt: { gte: ninetyDaysAgo },
      completedAt: { not: null }
    },
    select: { requestedAt: true, completedAt: true }
  });

  const avgResponseTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, req) => {
        const hours = (req.completedAt!.getTime() - req.requestedAt.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / completedRequests.length
    : 0;

  // Data Breaches
  const breaches = await prisma.breachLog.count({
    where: { detectedAt: { gte: ninetyDaysAgo } }
  });

  const criticalBreaches = await prisma.breachLog.count({
    where: { 
      detectedAt: { gte: ninetyDaysAgo },
      severity: 'CRITICAL'
    }
  });

  // Consent
  const totalUsers = await prisma.user.count({
    where: { deletedAt: null }
  });

  const consentRecords = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { dataProcessingConsent: true }
  });

  const analyticsConsent = consentRecords.filter(
    u => (u.dataProcessingConsent as any)?.analytics === true
  ).length;

  // Data Retention
  const ninetyDaysAgoDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oldUsageLogs = await prisma.promptRun.count({
    where: { createdAt: { lt: ninetyDaysAgoDate } }
  });

  const complianceRate = oldUsageLogs === 0 ? 100 : Math.max(0, 100 - (oldUsageLogs / 10));

  return NextResponse.json({
    dataSubjectRequests: {
      total: accessRequests + rectificationRequests + erasureRequests,
      avgResponseTime
    },
    dataBreaches: {
      total: breaches,
      critical: criticalBreaches
    },
    consent: {
      totalUsers,
      consentRate: (analyticsConsent / totalUsers) * 100
    },
    dataRetention: {
      complianceRate
    },
    vendorCompliance: {
      totalVendors: 5,
      dpasSigned: 5
    }
  });
}
