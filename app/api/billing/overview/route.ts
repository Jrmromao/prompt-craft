import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define the main handler
async function billingOverviewHandler(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const billingService = BillingService.getInstance();
    const overview = await billingService.getBillingOverview(userId);
    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching billing overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const GET = withDynamicRoute(billingOverviewHandler, fallbackData);
