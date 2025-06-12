import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UsageTrackingService } from '@/lib/services/usage/usageTrackingService';
import { withPlanLimitsMiddleware } from '@/middleware/withPlanLimits';
import { z } from 'zod';

const usageTrackingService = UsageTrackingService.getInstance();

const trackUsageSchema = z.object({
  feature: z.string(),
  count: z.number().min(1).default(1),
});

export const GET = withPlanLimitsMiddleware(async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    // If no specific feature or date range is requested, return usage metrics
    if (!feature && !startDate && !endDate) {
      const [metrics, limits] = await Promise.all([
        usageTrackingService.getUsageMetrics(userId),
        usageTrackingService.getUserLimits(userId)
      ]);

      return NextResponse.json({
        metrics,
        limits,
        usagePercentages: {
          prompts: (metrics.prompts / limits.maxPrompts) * 100,
          tokens: (metrics.tokens / limits.maxTokens) * 100,
          teamMembers: (metrics.team_members / limits.maxTeamMembers) * 100
        }
      });
    }

    // Otherwise, return usage history
    const usage = await usageTrackingService.getUsageHistory(
      userId,
      feature,
      startDate,
      endDate
    );

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { feature, count } = trackUsageSchema.parse(body);

    const usage = await usageTrackingService.trackUsage(userId, feature, count);

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error tracking usage:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
} 