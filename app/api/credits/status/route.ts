import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Mark this as a server component
export const preferredRegion = 'auto';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Use getInstance() to get service instances
    const creditService = CreditService.getInstance();
    const subscriptionService = SubscriptionService.getInstance();

    // Get credit usage
    const creditUsage = await creditService.getCreditUsage(userId);

    // Get subscription status
    const subscription = await subscriptionService.getSubscriptionDetails(userId);
    const isPro = subscription.planName === 'PRO' && subscription.status === 'ACTIVE';

    return NextResponse.json({
      ...creditUsage,
      isPro,
    });
  } catch (error) {
    console.error('Error fetching credit status:', error);
    return NextResponse.json({ error: 'Failed to fetch credit status' }, { status: 500 });
  }
}
