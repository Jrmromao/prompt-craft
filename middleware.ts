import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { quotaMiddleware } from './middleware/quota';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { auth } from '@clerk/nextjs/server';

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
      process.env.NEXT_PUBLIC_APP_URL || '',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com'
    ].filter(Boolean);
    
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

    return response;
  }

  // For non-API routes, check if it's a public route
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  const { userId } = await auth();
  if (!userId) {
    // Redirect to sign-in page if not authenticated
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

