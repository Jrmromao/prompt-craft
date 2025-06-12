import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MonitoringService } from '@/lib/services/monitoring/monitoringService';

const monitoringService = MonitoringService.getInstance();

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check
    const status = await monitoringService.getSystemStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching system status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check
    const { action } = await req.json();

    switch (action) {
      case 'check_subscription_health':
        await monitoringService.checkSubscriptionHealth();
        break;
      case 'check_usage_limits':
        await monitoringService.checkUsageLimits();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing monitoring action:', error);
    return NextResponse.json(
      { error: 'Failed to perform monitoring action' },
      { status: 500 }
    );
  }
} 