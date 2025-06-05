import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitMiddleware } from "./middleware/rate-limit";
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

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Handle public routes
  if (publicRoutes.some((route) => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
    return NextResponse.next();
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
    const rateLimitResponse = rateLimitMiddleware(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};