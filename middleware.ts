import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/pricing(.*)',
  '/legal(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
]);

export default clerkMiddleware((auth, request) => {
  // If not a public route and user is not authenticated, redirect to sign-in
  if (!isPublicRoute(request)) {
    const { userId } = auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
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
