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
  '/sign-in*',
  '/sign-up*',
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

// Function to validate request origin
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;
  
  return allowedOrigins.includes(origin);
}

// Function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    // Convert route pattern to regex
    const pattern = route.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

// Function to check if a route requires API key
function requiresApiKey(pathname: string): boolean {
  return API_KEY_ROUTES.some(route => {
    const pattern = route.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
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
const middleware = clerkMiddleware(async (auth, req) => {
  // Run security middleware first
  const securityResponse = await securityMiddleware(req);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Check if route requires API key
  if (requiresApiKey(req.nextUrl.pathname)) {
    const apiKeyResponse = await apiKeyMiddleware(req);
    if (apiKeyResponse.status !== 200) {
      return apiKeyResponse;
    }
  }

  return NextResponse.next();
});

// Export the middleware
export default middleware;

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // Match all API routes
    '/api/:path*',
    // Match all app routes except auth routes
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)',
  ],
};
