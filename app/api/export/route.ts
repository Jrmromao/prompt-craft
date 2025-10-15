import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ExportService } from '@/lib/services/exportService';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const exportService = ExportService.getInstance();

    if (format === 'csv') {
      const csv = await exportService.exportToCSV(user.id, startDate, endDate);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'report') {
      const report = await exportService.generateReport(user.id, startDate, endDate);
      return NextResponse.json(report);
    }

    const data = await exportService.exportToJSON(user.id, startDate, endDate);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
