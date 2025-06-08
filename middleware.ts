import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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

// Create a matcher for API routes
const isApiRoute = createRouteMatcher('/api/:path*');

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
    return new NextResponse(JSON.stringify({ error: 'Invalid origin' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        ...securityHeaders,
      },
    });
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

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all paths except static files and public assets
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2|ttf|eot)$).*)',
  ],
};

// Create the middleware chain
export default clerkMiddleware(async (auth, req) => {
  // Handle CORS for API routes
  if (isApiRoute(req)) {
    const response = NextResponse.next();

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }

    return response;
  }

  // Skip middleware for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Run security middleware for API routes
  if (isApiRoute(req)) {
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    // Check if route requires API key
    if (requiresApiKey(req)) {
      const apiKeyResponse = await apiKeyMiddleware(req);
      if (apiKeyResponse.status !== 200) {
        return apiKeyResponse;
      }
    }
  }

  // Protect the route if it's not public
  await auth.protect();

  return NextResponse.next();
});
