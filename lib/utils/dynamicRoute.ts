import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rateLimiter';

// Configuration for dynamic routes
export const dynamicRouteConfig = {
  dynamic: 'force-dynamic' as const,
  revalidate: 0,
  runtime: 'nodejs' as const,
};

// Rate limiter instance
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Security headers to be added to all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Set-Cookie': 'SameSite=Strict; Secure; HttpOnly',
} as const;

export type RouteHandler = (
  req: Request | NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export interface DynamicRouteConfig {
  handler: RouteHandler;
  fallbackData: unknown;
}

export function createDynamicRoute(config: DynamicRouteConfig): RouteHandler {
  return async (_req: Request | NextRequest, context: { params: Record<string, string> }) => {
    try {
      const nextReq = _req instanceof NextRequest ? _req : toNextRequest(_req);
      return await config.handler(nextReq, context);
    } catch (error) {
      console.error('Dynamic route error:', error);
      return NextResponse.json(config.fallbackData, { status: 500 });
    }
  };
}

export async function validateOrigin(req: Request | NextRequest): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

export function createProtectedRoute(handler: RouteHandler): RouteHandler {
  return async (req: Request | NextRequest, context: { params: Record<string, string> }) => {
    const nextReq = req instanceof NextRequest ? req : toNextRequest(req);
    if (!validateOrigin(nextReq)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    try {
      return await handler(nextReq, context);
    } catch (error) {
      console.error('Protected route error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// Function to add security headers to response
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Helper function to convert Request to NextRequest
export function toNextRequest(request: Request): NextRequest {
  return new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}

// Function to handle rate limiting
async function handleRateLimit(request: Request): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const isRateLimited = await rateLimiter.check(ip);

  if (isRateLimited) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }

  return null;
}

// Main wrapper function for dynamic routes
export function withDynamicRoute(handler: RouteHandler, fallbackData: unknown): RouteHandler {
  return async (request: Request, context: { params: Record<string, string> }) => {
    try {
      // Check if we're in a build context
      const headersList = await headers();
      const isBuildTime = headersList.get('x-vercel-deployment-url') !== null;

      if (isBuildTime) {
        return NextResponse.json(fallbackData);
      }

      // Validate request
      if (!request) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Request is required' }, { status: 400 })
        );
      }

      // Check rate limit
      const rateLimitResponse = await handleRateLimit(request);
      if (rateLimitResponse) {
        return addSecurityHeaders(rateLimitResponse);
      }

      // Execute the handler
      const response = await handler(request, context);

      // Add security headers to the response
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('Dynamic route error:', error);
      return addSecurityHeaders(
        NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      );
    }
  };
}
