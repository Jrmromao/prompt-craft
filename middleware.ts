import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { quotaMiddleware } from './middleware/quota';
import { rateLimitMiddleware } from './middleware/rate-limit';
import type { ClerkMiddlewareAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server'; 

// Define types for session claims
type PrivateMetadata = {
  databaseId?: string;
};

type PublicMetadata = {
  role?: string;
};

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
  '/api/prompts/(.*)/comments',
  '/api/prompts/(.*)/comments/(.*)',
  '/api/prompts/(.*)/vote',
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
const isStripeRoute = createRouteMatcher('/api/stripe/:path*');

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

const isAdminRoute = createRouteMatcher(['/admin', '/admin/users', '/admin/analytics', '/admin/settings']);

const roleBasedRoutes = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/users': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/analytics': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/settings': ['SUPER_ADMIN'],
};

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
  const session = await auth();
  
  // Handle role-based access
  const path = req.nextUrl.pathname;
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (path.startsWith(route)) {
      const publicMetadata = session.sessionClaims?.publicMetadata as PublicMetadata;
      const userRole = publicMetadata?.role || 'USER';
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

