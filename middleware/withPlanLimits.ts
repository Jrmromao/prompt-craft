import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UsageTrackingService } from '@/lib/services/usage/usageTrackingService';

type FeatureLimits = {
  maxPrompts: number;
  maxTokens: number;
  maxTeamMembers: number;
};

type Feature = 'prompts' | 'tokens' | 'team_members';

const featureToLimitKey: Record<Feature, keyof FeatureLimits> = {
  prompts: 'maxPrompts',
  tokens: 'maxTokens',
  team_members: 'maxTeamMembers',
};

export function withPlanLimitsMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if the request is for usage tracking
      if (req.method === 'POST' && req.nextUrl.pathname === '/api/usage') {
        const body = await req.json();
        const { feature, count } = body;

        // Validate feature
        if (!Object.keys(featureToLimitKey).includes(feature)) {
          return NextResponse.json(
            { error: `Invalid feature: ${feature}` },
            { status: 400 }
          );
        }

        // Get user's current usage and limits
        const usageService = UsageTrackingService.getInstance();
        const [currentUsage, limits] = await Promise.all([
          usageService.getCurrentPeriodUsage(userId, feature),
          usageService.getUserLimits(userId)
        ]);

        // Check if the new usage would exceed limits
        const limitKey = featureToLimitKey[feature as Feature];
        const limit = limits[limitKey];
        const currentCount = currentUsage[feature] || 0;

        if (currentCount + count > limit) {
          return NextResponse.json(
            { error: `Usage limit exceeded for feature: ${feature}` },
            { status: 403 }
          );
        }
      }

      // If all checks pass, proceed with the request
      return handler(req);
    } catch (error) {
      console.error('Error in plan limits middleware:', error);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }
  };
}

// Example usage:
/*
export const POST = withPlanLimitsMiddleware(
  async (req: NextRequest) => {
    // Your API route handler
  },
  'advanced_analytics' // Optional feature requirement
);
*/ 