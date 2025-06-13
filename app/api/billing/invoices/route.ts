import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';
import { trackUserFlowError, trackUserFlowEvent } from '@/lib/error-tracking';
import { logAudit } from '@/app/lib/auditLogger';
import { AuditAction } from '@/app/constants/audit';

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

    trackUserFlowEvent('payment_processing', 'invoices_fetched', { 
      userId,
      invoiceCount: billingData.invoices.length 
    });

    // Audit log for invoice view
    await logAudit({
      action: AuditAction.INVOICE_VIEWED,
      userId,
      resource: 'invoice',
      details: { invoiceCount: billingData.invoices.length },
    });

    return NextResponse.json({ invoices: billingData.invoices });
  } catch (error) {
    trackUserFlowError('payment_processing', error as Error, { 
      action: 'fetch_invoices',
      userId: (await auth()).userId 
    });
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 