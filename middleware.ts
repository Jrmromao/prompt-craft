import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
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

// Create route matchers
const isPublicRoute = createRouteMatcher(publicRoutes);
const isAdminRoute = createRouteMatcher(adminRoutes);
const isRateLimitedRoute = createRouteMatcher(RATE_LIMITED_ROUTES);
const isValidatedRoute = createRouteMatcher(VALIDATED_ROUTES);
const isApiKeyRoute = createRouteMatcher(API_KEY_ROUTES);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    // Add request ID tracking
    const requestIdResponse = requestIdMiddleware(req);
    if (requestIdResponse) {
      return requestIdResponse;
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "block-all-mixed-content",
        "upgrade-insecure-requests"
      ].join('; ')
    );
    
    // Permissions Policy
    response.headers.set(
      'Permissions-Policy',
      [
        'accelerometer=()',
        'camera=()',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'payment=()',
        'usb=()',
        'interest-cohort=()'
      ].join(', ')
    );
    
    // CORS headers
    const allowedOrigins = [
      'https://www.prompthive.co',
      'https://prompthive.co',
      'https://prompt-craft-git-main-joao-romaos-projects.vercel.app'
    ];
    
    const origin = req.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }

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
    if (isPublicRoute(req)) {
      return response;
    }

    // Handle API key routes
    if (isApiKeyRoute(req)) {
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

    // Add user ID to headers for downstream middleware
    response.headers.set('x-user-id', userId);

    // Apply rate limiting to API routes
    if (isRateLimitedRoute(req)) {
      try {
        const rateLimitResponse = await withErrorHandling(rateLimitMiddleware)(req);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Continue execution even if rate limiting fails
      }
    }

    // Apply input validation to API routes
    if (isValidatedRoute(req)) {
      try {
        const validationResponse = validationMiddleware(req);
        if (validationResponse) {
          return validationResponse;
        }
      } catch (error) {
        console.error('Validation error:', error);
        // Continue execution even if validation fails
      }
    }

    // Apply quota enforcement for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      try {
        const quotaResponse = await withErrorHandling(quotaMiddleware)(req);
        if (quotaResponse) {
          return quotaResponse;
        }
      } catch (error) {
        console.error('Quota middleware error:', error);
        // Continue execution even if quota check fails
      }
    }

    // Handle admin routes
    if (isAdminRoute(req)) {
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
    console.error('Middleware error:', {
      error,
      path: req.nextUrl.pathname,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    });
    // Return a basic response in case of errors
    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
