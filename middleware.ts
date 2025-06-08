import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { quotaMiddleware } from './middleware/quota';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { apiKeyMiddleware } from './middleware/api-key';
import { securityHeaders } from '@/app/api/config';

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health',
  '/api/test',
  '/api/forms(.*)',
  '/api/email-signup',
  '/api/upload(.*)',
  '/api/ai/generate',
  '/api/ai/run',
  '/api/prompts(.*)',
  '/api/comments(.*)',
  '/api/billing(.*)',
  '/api/subscription(.*)',
  '/api/credits(.*)',
  '/api/support(.*)',
  '/api/user(.*)',
  '/api/profile(.*)',
  '/api/settings(.*)',
  '/api/admin(.*)',
  '/api/moderated-words(.*)',
  '/api/create-users(.*)',
  '/api/playground(.*)',
  '/api/test(.*)',
];

// Define routes that require API key authentication
const API_KEY_ROUTES = ['/api/v1(.*)'];

// Create route matchers
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const requiresApiKey = createRouteMatcher(API_KEY_ROUTES);

// Function to validate request origin
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;
  
  return allowedOrigins.includes(origin);
}

// Security middleware
async function securityMiddleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Validate origin
  if (!validateOrigin(request)) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid origin' }),
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders
        }
      }
    );
  }

  // Check rate limit
  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check quota
  const quotaResponse = await quotaMiddleware(request);
  if (quotaResponse) {
    return quotaResponse;
  }

  // Get the response
  const response = NextResponse.next();

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Create the middleware chain
export default clerkMiddleware(async (auth, request) => {
  // Skip middleware for auth routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Run security middleware first
  const securityResponse = await securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Check if route requires API key
  if (requiresApiKey(request)) {
    const apiKeyResponse = await apiKeyMiddleware(request);
    if (apiKeyResponse.status !== 200) {
      return apiKeyResponse;
    }
  }

  // Protect the route if it's not public
  await auth.protect();

  return NextResponse.next();
}, {
  debug: process.env.NODE_ENV === 'development'
});

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
