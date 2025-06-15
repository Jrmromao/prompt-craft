import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { toCsvRow } from '@/lib/utils/csv';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's credit history
    const creditHistory = await prisma.creditHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log the export action
    await AuditService.getInstance().logAudit({
      userId,
      action: AuditAction.USER_GET_USAGE,
      resource: 'credits',
      details: {
        exportType: 'csv',
        recordCount: creditHistory.length,
        dateRange: {
          from: creditHistory[creditHistory.length - 1]?.createdAt,
          to: creditHistory[0]?.createdAt
        }
      }
    });

    // Convert to CSV format
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Balance'];
    let runningBalance = 0;
    const rows = creditHistory.map(entry => {
      runningBalance += entry.amount;
      return [
        format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        entry.type,
        entry.amount,
        entry.description || '',
        runningBalance
      ];
    });

    // Create CSV content
    const csvContent = [
      toCsvRow(headers),
      ...rows.map(row => toCsvRow(row))
    ].join('\n');

    // Create response with CSV file
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="credit-history-${format(new Date(), 'yyyy-MM-dd')}.csv"`
    );

    return response;
  } catch (error) {
    console.error('Error exporting credit usage:', error);
    return NextResponse.json(
      { error: 'Failed to export credit usage' },
      { status: 500 }
    );
  }
} 