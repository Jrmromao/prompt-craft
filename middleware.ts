import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { quotaMiddleware } from './middleware/quota';

// CSP with Google Fonts support
const CSP_POLICY = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev; connect-src 'self' https://*.clerk.accounts.dev; img-src 'self' data: https: https://img.clerk.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.clerk.accounts.dev; form-action 'self'; frame-ancestors 'self'";

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health',
  '/api/email-signup',
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
  '/account-test',
  '/account',
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
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://prompthive.co',
    'https://www.prompthive.co',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [])
  ].filter(Boolean);

  return allowedOrigins.includes(origin);
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
    const isValidOrigin = validateOrigin(request);
    
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isValidOrigin && origin ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Content-Security-Policy': CSP_POLICY,
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
        'Access-Control-Allow-Origin': 'null',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Security-Policy': CSP_POLICY,
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
  const isValidOrigin = validateOrigin(request);
  response.headers.set('Access-Control-Allow-Origin', isValidOrigin && origin ? origin : 'null');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-Clerk-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Content-Security-Policy', CSP_POLICY);

  return response;
}

const isAdminRoute = createRouteMatcher(['/admin', '/admin/users', '/admin/analytics', '/admin/settings']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const PROTECTED_ROUTES = [
    '/dashboard',
    '/prompts',
    '/playground', 
    '/account',
    '/profile',
    '/settings',
    '/admin',
    '/onboarding',
    '/complete-signup'
  ];

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const { userId, sessionClaims } = await auth();
    
    // If not authenticated, redirect to sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    // Handle admin role-based access
    if (pathname.startsWith('/admin')) {
      const userRole = (sessionClaims?.publicMetadata as any)?.role as string;
      const allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/api/account(.*)',
    '/api/profile(.*)',
  ],
};

