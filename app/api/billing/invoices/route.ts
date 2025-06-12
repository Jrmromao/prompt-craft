import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';
import * as Sentry from '@sentry/nextjs';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/billing/invoices',
    },
    async () => {
      try {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const billingService = BillingService.getInstance();
        const billingData = await billingService.getBillingOverview(userId);

        return NextResponse.json({ invoices: billingData.invoices });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: 'Failed to fetch invoices' },
          { status: 500 }
        );
      }
    }
  );
} 