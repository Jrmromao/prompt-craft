import { NextRequest, NextResponse } from 'next/server';
import { ReputationService } from '@/lib/services/ReputationService';
import { ErrorHandlingService } from '@/lib/services/ErrorHandlingService';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const reputationService = ReputationService.getInstance();
    const errorService = ErrorHandlingService.getInstance();

    const [abuseReports, errorStats, userStats] = await Promise.all([
      prisma.voteAbuseDetection.findMany({
        take: 10,
        orderBy: { detectedAt: 'desc' },
        include: { user: { select: { id: true, email: true } } }
      }),
      errorService.getErrorStats(),
      prisma.user.aggregate({
        _count: { id: true },
        _avg: { reputation: true }
      })
    ]);

    return NextResponse.json({
      abuse: {
        totalReports: abuseReports.length,
        recentReports: abuseReports.map(report => ({
          id: report.id,
          userId: report.userId,
          type: report.abuseType,
          severity: report.severity,
          timestamp: report.detectedAt,
          details: report.details
        }))
      },
      errors: errorStats,
      users: {
        total: userStats._count.id,
        avgReputation: userStats._avg.reputation || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
