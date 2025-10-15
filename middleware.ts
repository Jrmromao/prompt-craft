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
  const { userId } = await auth();
  const isSignInPage = request.nextUrl.pathname.startsWith('/sign-in');
  const isSignUpPage = request.nextUrl.pathname.startsWith('/sign-up');

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
