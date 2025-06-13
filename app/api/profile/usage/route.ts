import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UsageService } from '@/lib/services/usageService';
import { AuditAction } from '@/app/constants/audit';
import { logAudit } from '@/app/lib/auditLogger';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usageService = UsageService.getInstance();
    const usageData = await usageService.getUserUsage(userId);

    await logAudit({
      action: AuditAction.USER_GET_USAGE,
      userId,
      resource: 'usage',
      status: 'success',
      details: { usageData },
    });
    
    return NextResponse.json(usageData);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
