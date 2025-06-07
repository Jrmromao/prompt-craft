import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth, clerkMiddleware } from '@clerk/nextjs/server';
import { quotaMiddleware } from './middleware/quota';
import { prisma } from '@/lib/prisma';
import { RateLimiter } from '@/lib/rateLimiter';
import { securityHeaders } from '@/app/api/config';

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/api/webhooks(.*)',
  '/api/health',
  '/api/test',
  '/api/forms(.*)',
  '/api/email-signup',
  '/api/upload(.*)',
  '/api/ai/generate',
  '/api/ai/run',
  '/api/prompts(.*)',
  '/api/comments(.*)',
  '/api/billing(.*)',
  '/api/subscription(.*)',
  '/api/credits(.*)',
  '/api/support(.*)',
  '/api/user(.*)',
  '/api/profile(.*)',
  '/api/settings(.*)',
  '/api/admin(.*)',
  '/api/moderated-words(.*)',
  '/api/create-users(.*)',
  '/api/playground(.*)',
  '/api/test(.*)',
];

// Define routes that require API key authentication
const API_KEY_ROUTES = ['/api/v1(.*)'];

// Rate limiter instance
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Function to validate request origin
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;
  
  return allowedOrigins.includes(origin);
}

// Error handling wrapper
function withErrorHandling(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('Middleware error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...securityHeaders
          }
        }
      );
    }
  };
}

// Security middleware
const securityMiddleware = withErrorHandling(async (request: NextRequest) => {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Validate origin
  if (!validateOrigin(request)) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid origin' }),
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders
        }
      }
    );
  }

  // Check rate limit
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const isRateLimited = await rateLimiter.check(ip);
  
  if (isRateLimited) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again later' }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders
        }
      }
    );
  }

  // Get the response
  const response = NextResponse.next();

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});

// Export the middleware
export default clerkMiddleware();

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
