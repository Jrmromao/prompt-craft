import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { validationMiddleware } from './middleware/validation';
import { apiKeyMiddleware } from './middleware/api-key';
import { ipBlockMiddleware } from './middleware/ip-block';
import { apiVersionMiddleware } from './middleware/api-version';
import { requestIdMiddleware } from './middleware/request-id';
import { quotaMiddleware } from './middleware/quota';
import { prisma } from '@/lib/prisma';

// Define routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/legal/terms',
  '/legal/privacy',
  '/about',
  '/careers',
  '/blog',
  '/contact',
  '/api/webhook(.*)',
  '/api/health',
  '/terms',
  '/privacy',
  '/pricing',
  // "/onboarding(.*)",
  // "/api/onboarding(.*)",
];

// Define routes that require admin access
const adminRoutes: string[] = [];

// Define routes that should be rate limited
const RATE_LIMITED_ROUTES = ['/api/prompts(.*)', '/api/community(.*)', '/api/analytics(.*)'];

// Define routes that require validation
const VALIDATED_ROUTES = ['/api/prompts(.*)', '/api/community(.*)'];

// Define routes that require API key authentication
const API_KEY_ROUTES = ['/api/v1(.*)'];

// Error handling wrapper
const withErrorHandling = (handler: (req: NextRequest) => Promise<NextResponse | null>) => {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Middleware error:', error);
      // Return null to continue the request chain
      return null;
    }
  };
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    // Add request ID tracking
    const requestIdResponse = requestIdMiddleware(req);
    if (requestIdResponse) {
      return requestIdResponse;
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Apply IP blocking
    const ipBlockResponse = await withErrorHandling(ipBlockMiddleware)(req);
    if (ipBlockResponse) {
      return ipBlockResponse;
    }

    // Apply API versioning for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const versionResponse = apiVersionMiddleware(req);
      if (versionResponse) {
        return versionResponse;
      }
    }

    // Handle public routes
    if (publicRoutes.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      return response;
    }

    // Handle API key routes
    if (API_KEY_ROUTES.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      const apiKeyResponse = await withErrorHandling(apiKeyMiddleware)(req);
      if (apiKeyResponse) {
        return apiKeyResponse;
      }
      return response;
    }

    // Handle unauthenticated users
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Apply rate limiting to API routes
    if (RATE_LIMITED_ROUTES.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      const rateLimitResponse = await withErrorHandling(rateLimitMiddleware)(req);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }

    // Apply input validation to API routes
    if (VALIDATED_ROUTES.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      const validationResponse = validationMiddleware(req);
      if (validationResponse) {
        return validationResponse;
      }
    }

    // Apply quota enforcement for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const quotaResponse = await withErrorHandling(quotaMiddleware)(req);
      if (quotaResponse) {
        return quotaResponse;
      }
    }

    // Handle admin routes
    if (adminRoutes.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      try {
        const user = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { role: true },
        });

        if (!user || user.role !== 'ADMIN') {
          return new NextResponse('Unauthorized', { status: 403 });
        }
      } catch (error) {
        console.error('Database error:', error);
        // Fail open for database errors
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a basic response in case of errors
    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
