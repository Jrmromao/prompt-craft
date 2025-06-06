import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { validationMiddleware } from "./middleware/validation";
import { prisma } from "@/lib/prisma";

// Define routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/legal/terms",
  "/legal/privacy",
  "/about",
  "/careers",
  "/blog",
  "/contact",
  "/api/webhook(.*)",
  "/api/health",
  "/terms",
  "/privacy",
  "/pricing",
  // "/onboarding(.*)",
  // "/api/onboarding(.*)",
];

// Define routes that require admin access
const adminRoutes = ["/admin(.*)"];

// Define routes that should be rate limited
const RATE_LIMITED_ROUTES = [
  "/api/prompts(.*)",
  "/api/community(.*)",
  "/api/analytics(.*)",
];

// Define routes that require validation
const VALIDATED_ROUTES = [
  "/api/prompts(.*)",
  "/api/community(.*)",
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Handle public routes
  if (publicRoutes.some((route) => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
    return response;
  }

  // Handle unauthenticated users
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Apply rate limiting to API routes
  if (RATE_LIMITED_ROUTES.some((route) => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Apply input validation to API routes
  if (VALIDATED_ROUTES.some((route) => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
    const validationResponse = validationMiddleware(req);
    if (validationResponse) {
      return validationResponse;
    }
  }

  // Handle admin routes
  if (adminRoutes.some((route) => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
  }

  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};