import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { rateLimit } from '@/lib/utils/rateLimit';
import { securityHeaders, cacheConfig } from '@/app/api/config';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

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
    try {
      await limiter.check(30, userId); // 30 requests per minute per user
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: securityHeaders }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const type = searchParams.get('type') || 'all';

    const analyticsService = AnalyticsService.getInstance();
    const result = await analyticsService.getAnalytics({
      period,
      type,
      userId
    });

    // Create response with security headers
    const response = NextResponse.json(result);
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add cache headers
    response.headers.set('Cache-Control', `public, s-maxage=${cacheConfig.durations.short}, stale-while-revalidate=${cacheConfig.durations.short * 2}`);
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
          ...securityHeaders
        }
      }
    );
  }
}

// Export the handler
export const GET = analyticsHandler;
