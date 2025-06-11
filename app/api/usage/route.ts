import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UsageTrackingService } from '@/lib/services/usageTrackingService';
import { withPlanLimitsMiddleware } from '@/middleware/withPlanLimits';

export const GET = withPlanLimitsMiddleware(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageService = UsageTrackingService.getInstance();
    const [metrics, limits] = await Promise.all([
      usageService.getUserMetrics(userId),
      usageService.getUserLimits(userId)
    ]);

    return NextResponse.json({
      metrics,
      limits,
      usagePercentages: {
        prompts: (metrics.promptCount / limits.maxPrompts) * 100,
        tokens: (metrics.tokenUsage / limits.maxTokens) * 100,
        teamMembers: (metrics.teamMemberCount / limits.maxTeamMembers) * 100
      }
    });
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics' },
      { status: 500 }
    );
  }
}); 