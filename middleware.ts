import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { validateApiTokenEdge } from './lib/edge-token-validation';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/pricing(.*)',
  '/legal(.*)',
  '/docs(.*)',
  '/blog(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/blog(.*)',
]);


export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const isSignInPage = request.nextUrl.pathname.startsWith('/sign-in');
  const isSignUpPage = request.nextUrl.pathname.startsWith('/sign-up');
  const hostname = request.headers.get('host') || '';
  const isApiSubdomain = hostname.startsWith('api.');

  // Handle API subdomain requests
  if (isApiSubdomain) {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid API token' }, 
        { status: 401 }
      );
    }

    // Validate API token with edge-compatible validation
    const isValidToken = await validateApiTokenEdge(token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid API token' }, 
        { status: 401 }
      );
    }

    // Allow API requests with valid token
    return NextResponse.next();
  }

  // Handle API routes that need Bearer token validation (for SDK)
  // Only protect specific API endpoints that require Bearer tokens
  const bearerTokenRoutes = [
    '/api/quality/routing',
    '/api/integrations/run', 
    '/api/cache/get',
    '/api/cache/set',
    '/api/prompts/optimize'
  ];
  
  const needsBearerToken = bearerTokenRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (needsBearerToken) {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid API token' }, 
        { status: 401 }
      );
    }

    // Validate API token with edge-compatible validation
    const isValidToken = await validateApiTokenEdge(token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid API token' }, 
        { status: 401 }
      );
    }
  }

  // If user is logged in and trying to access sign-in/sign-up, redirect to dashboard
  if (userId && (isSignInPage || isSignUpPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
