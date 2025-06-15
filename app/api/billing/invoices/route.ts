import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';
import { trackUserFlowError, trackUserFlowEvent } from '@/lib/error-tracking';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    trackUserFlowEvent('payment_processing', 'fetch_invoices', { userId });

    const billingService = BillingService.getInstance();
    const billingData = await billingService.getBillingOverview(userId);

    if (!billingData) {
      return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
    }

    trackUserFlowEvent('payment_processing', 'invoices_fetched', { 
      userId,
      invoiceCount: billingData.invoices?.length || 0 
    });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Audit log for invoice view
    await AuditService.getInstance().logAudit({
      action: AuditAction.INVOICE_VIEWED,
      userId: user.id,
      resource: 'invoice',
      details: { invoiceCount: billingData.invoices?.length || 0 },
    });

    return NextResponse.json({ invoices: billingData.invoices || [] });
  } catch (error) {
    trackUserFlowError('payment_processing', error as Error, { 
      action: 'fetch_invoices',
      userId: (await auth()).userId 
    });
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 