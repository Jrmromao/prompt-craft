import { NextRequest, NextResponse } from 'next/server';
import { QuotaService } from '@/lib/services/quota-service';

type QuotaType = 'API_CALLS' | 'PROMPT_GENERATIONS' | 'STORAGE';

export async function quotaMiddleware(req: NextRequest) {
  const quotaService = QuotaService.getInstance();
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return null; // Skip quota check if no user ID
  }

  // Determine quota type based on the request path
  let quotaType: QuotaType;
  if (req.nextUrl.pathname.startsWith('/api/prompts/generate')) {
    quotaType = 'PROMPT_GENERATIONS';
  } else if (req.nextUrl.pathname.startsWith('/api/storage')) {
    quotaType = 'STORAGE';
  } else {
    quotaType = 'API_CALLS';
  }

  // Check quota
  const quotaResult = await quotaService.checkQuota(userId, quotaType);

  if (!quotaResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Quota exceeded',
        message: `You have exceeded your ${quotaType.toLowerCase()} quota. Please upgrade your plan or try again later.`,
        remaining: quotaResult.remaining ?? 0,
        total: quotaResult.total ?? 0,
        resetAt: quotaResult.resetAt ?? null,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': (quotaResult.total ?? 0).toString(),
          'X-RateLimit-Remaining': (quotaResult.remaining ?? 0).toString(),
          'X-RateLimit-Reset': quotaResult.resetAt?.toISOString() || '',
        },
      }
    );
  }

  // Add quota headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', (quotaResult.total ?? 0).toString());
  response.headers.set('X-RateLimit-Remaining', (quotaResult.remaining ?? 0).toString());
  response.headers.set('X-RateLimit-Reset', quotaResult.resetAt?.toISOString() || '');

  return response;
}
