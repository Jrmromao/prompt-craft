import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { UsageService } from '@/lib/services/usageService';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usageService = UsageService.getInstance();
    const usageData = await usageService.getUserUsage(userId);

    return NextResponse.json(usageData);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
