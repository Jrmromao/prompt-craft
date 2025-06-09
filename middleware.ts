import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { quotaMiddleware } from './middleware/quota';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { auth, getAuth } from '@clerk/nextjs/server';

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
  '/api/prompts/(.*)/comments',  // Allow GET requests to comments
  '/api/prompts/(.*)/comments/(.*)',  // Allow GET requests to specific comments
  '/api/prompts/(.*)/vote',  // Allow vote requests
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
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/faq',
  '/pricing',
  '/blog',
  '/careers',
  '/team',
  '/legal',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookie-policy',
  '/legal/refund-policy',
  '/legal/dmca-policy',
  '/legal/copyright-policy',
  '/community-prompts',
];

// Create route matchers
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isApiRoute = createRouteMatcher('/api/:path*');
const isCommentRoute = createRouteMatcher('/api/prompts/:id/comments');
const isVoteRoute = createRouteMatcher('/api/prompts/:id/vote');

// List of paths that should be handled dynamically
const dynamicPaths = [
  '/community-prompts',
  '/api/prompts/public',
  '/api/auth/check-admin',
];

// Function to validate request origin
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  console.log('Request details:', {
    path: request.nextUrl.pathname,
    method: request.method,
    origin,
    referer,
    headers: Object.fromEntries(request.headers.entries())
  });
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;
  
  // Allow localhost during development
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return true;
    }
  }

  // In production, allow requests from your domain and Clerk domains
  if (process.env.NODE_ENV === 'production') {
    const allowedDomains = [
      'https://www.prompthive.co',
      'https://prompthive.co',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com'
    ];
    
    return allowedDomains.some(domain => 
      origin === domain || 
      (domain.includes('*') && origin.match(new RegExp(domain.replace('*', '.*'))))
    );
  }

  return false;
}

// Security middleware
async function securityMiddleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    console.log('Handling OPTIONS request for origin:', origin);
    
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.accounts.dev; img-src 'self' data: https: https://img.clerk.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.clerk.accounts.dev; form-action 'self'; frame-ancestors 'self'",
      },
    });
  }

  // Validate origin
  if (!validateOrigin(request)) {
    const origin = request.headers.get('origin');
    console.log('Origin validation failed for:', {
      path: request.nextUrl.pathname,
      origin,
      method: request.method
    });
    
    return new NextResponse(JSON.stringify({ error: 'Invalid origin' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.accounts.dev; img-src 'self' data: https: https://img.clerk.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.clerk.accounts.dev; form-action 'self'; frame-ancestors 'self'",
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

  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  const origin = request.headers.get('origin');
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.accounts.dev; img-src 'self' data: https: https://img.clerk.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.clerk.accounts.dev; form-action 'self'; frame-ancestors 'self'");

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

// Create the middleware chain
export default clerkMiddleware(async (auth, req) => {
  // Handle CORS for API routes
  if (isApiRoute(req)) {
    const response = NextResponse.next();

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }

    // Special handling for vote routes
    if (isVoteRoute(req)) {
      // For GET requests, allow public access
      if (req.method === 'GET') {
        return response;
      }
      
      // For POST requests, require authentication
      const { userId } = await auth();
      if (!userId) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: response.headers,
        });
      }
      return response;
    }

    // Special handling for comment routes
    if (isCommentRoute(req)) {
      // For GET requests, allow public access
      if (req.method === 'GET') {
        return response;
      }
      
      // For POST requests, require authentication
      const { userId } = await auth();
      if (!userId) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: response.headers,
        });
      }
      return response;
    }

    // Skip middleware for public routes
    if (isPublicRoute(req)) {
      return response;
    }

    // For all other API routes, require authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: response.headers,
      });
    }
  }

  const { pathname } = req.nextUrl;

  // Check if the path should be handled dynamically
  const isDynamicPath = dynamicPaths.some(path => pathname.startsWith(path));

  if (isDynamicPath) {
    // Add security headers for dynamic routes
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add rate limiting headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    
    return response;
  }

  return NextResponse.next();
});
