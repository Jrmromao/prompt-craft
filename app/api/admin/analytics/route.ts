import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { rateLimiter } from '@/lib/utils/rateLimit';
import { securityHeaders, cacheConfig } from '@/app/api/config';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define allowed periods and types
const allowedPeriods = ['daily', 'weekly', 'monthly', 'yearly'] as const;
const allowedTypes = ['all', 'users', 'prompts', 'usage'] as const;

type Period = (typeof allowedPeriods)[number];
type AnalyticsType = (typeof allowedTypes)[number];

// Define the handler
async function analyticsHandler(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: securityHeaders }
      );
    }

    // Rate limiting per user
    const { success, limit, reset, remaining } = await rateLimiter.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rawPeriod = searchParams.get('period');
    const rawType = searchParams.get('type');

    const period = allowedPeriods.includes(rawPeriod as Period) ? (rawPeriod as Period) : 'daily';
    const type = allowedTypes.includes(rawType as AnalyticsType)
      ? (rawType as AnalyticsType)
      : 'all';

    const analyticsService = AnalyticsService.getInstance();
    const result = await analyticsService.getAnalytics({
      period,
      type,
      userId,
    });

    // Create response with security headers
    const response = NextResponse.json(result);

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheConfig.durations.short}, stale-while-revalidate=${cacheConfig.durations.short * 2}`
    );
    response.headers.set('Cache-Tag', cacheConfig.tags.analytics);

    return response;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders,
        },
      }
    );
  }
}

// Export the handler
export const GET = analyticsHandler;
