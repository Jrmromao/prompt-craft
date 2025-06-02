import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { Role } from "@/utils/constants";

// Define custom session claims type
interface UserMetadata {
    role: string;
    onboarded: boolean;
    subscription?: {
        iat: number;
        status?: string;
        tier?: string;
        subscriptionId?: string;
        currentPeriodEnd?: string;
    };
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = createRouteMatcher([
    '/',
    '/api/webhooks/(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing',
    '/about',
    '/contact',
    '/onboarding(.*)',
    '/api/onboarding(.*)',
]);

// Routes that require Pro subscription
const PRO_ONLY_ROUTES = createRouteMatcher([
    '/api/ai/generate/advanced',
    '/api/ai/generate/gpt4',
    '/api/ai/generate/claude',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Check if route is public
    if (PUBLIC_ROUTES(req)) {
        return NextResponse.next();
    }

    // Authenticate the request
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    // Redirect to sign-in if not authenticated
    if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Check if user is trying to access Pro-only routes
    if (PRO_ONLY_ROUTES(req)) {
        const metadata = sessionClaims?.metadata as unknown as UserMetadata;
        const isPro = metadata?.role === Role.PRO || 
                     (metadata?.subscription?.status === 'active' && 
                      metadata?.subscription?.tier === 'PRO');

        if (!isPro) {
            return NextResponse.json({
                error: 'This feature requires a Pro subscription',
                upgradeRequired: true,
            }, { status: 403 });
        }
    }

    // API routes (except webhooks) should be accessible to authenticated users
    if (path.startsWith('/api/') && !path.startsWith('/api/webhooks/')) {
        return NextResponse.next();
    }

    // Check subscription status for protected routes
    try {
        const metadata = sessionClaims?.metadata as unknown as UserMetadata;

        // Check if user is an admin or has an active subscription
        const isAdmin = metadata?.role === Role.ADMIN;
        const hasActiveSubscription =
            metadata?.subscription?.status === 'active' &&
            ['PRO', 'pro'].includes(metadata?.subscription?.tier || '');

        // All checks passed, continue to protected route
        return NextResponse.next();
    } catch (error) {
        console.error('Error in subscription middleware:', error);
        return NextResponse.redirect(new URL('/error?code=middleware_error', req.url));
    }
});

// Export config for Clerk middleware
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};