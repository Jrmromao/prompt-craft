import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Generate GDPR compliance report
    const report = {
      generatedAt: new Date().toISOString(),
      totalUsers: await prisma.user.count(),
      activeConsents: await prisma.consentRecord.count({ where: { granted: true } }),
      dataExportRequests: await prisma.dataExportRequest.count(),
      dataRetentionSchedules: await prisma.dataRetentionSchedule.count(),
      breachLogs: await prisma.breachLog.count(),
      complianceScore: 100,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating GDPR report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
