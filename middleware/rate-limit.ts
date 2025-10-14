import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client for distributed rate limiting
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('Redis configuration missing. Rate limiting will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB in bytes

// Secure rate limits for different routes
const ROUTE_LIMITS = {
  default: 30,
  auth: 5,      // 5 attempts per hour for auth
  comments: 10,
  votes: 20,
  password: 3,  // 3 attempts per hour for password changes
  cookies: 10,
} satisfies Record<string, number>;

// Progressive penalties for violations
const PROGRESSIVE_PENALTIES = {
  1: 60,    // 1 minute
  2: 300,   // 5 minutes  
  3: 900,   // 15 minutes
  4: 3600,  // 1 hour
  5: 86400, // 24 hours
};

export async function rateLimitMiddleware(request: NextRequest) {
  // Check request size
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  if (contentLength > MAX_REQUEST_SIZE) {
    return new NextResponse('Request Entity Too Large', {
      status: 413,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // If Redis is not available, skip rate limiting
  if (!redis) {
    return null;
  }

  // Get IP from headers or use a fallback
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'anonymous';

  // Determine rate limit based on route
  let maxRequests = ROUTE_LIMITS.default;
  let windowSeconds = 60; // Default 1 minute window
  
  if (request.nextUrl.pathname.includes('/comments')) {
    maxRequests = ROUTE_LIMITS.comments;
  } else if (request.nextUrl.pathname.includes('/vote')) {
    maxRequests = ROUTE_LIMITS.votes;
  } else if (request.nextUrl.pathname.includes('/cookies')) {
    maxRequests = ROUTE_LIMITS.cookies;
  } else if (request.nextUrl.pathname.includes('/password')) {
    maxRequests = ROUTE_LIMITS.password;
    windowSeconds = 3600; // 1 hour window for password changes
  } else if (request.nextUrl.pathname.includes('/sign-in') || request.nextUrl.pathname.includes('/sign-up')) {
    maxRequests = ROUTE_LIMITS.auth;
    windowSeconds = 3600; // 1 hour window for auth
  }

  // Check for existing violations and apply progressive penalties
  const violationKey = `violations:${ip}`;
  const violations = parseInt(await redis.get(violationKey) || '0');
  
  if (violations > 0) {
    const penalty = PROGRESSIVE_PENALTIES[Math.min(violations, 5)] || 86400;
    const blockedKey = `blocked:${ip}`;
    const isBlocked = await redis.get(blockedKey);
    
    if (isBlocked) {
      const ttl = await redis.ttl(blockedKey);
      return new NextResponse(
        JSON.stringify({
          error: 'IP Temporarily Blocked',
          message: `Too many violations. Blocked for ${Math.ceil(ttl / 60)} minutes.`,
          retryAfter: ttl,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': ttl.toString(),
          },
        }
      );
    }
  }

  // Use Redis for distributed rate limiting
  const key = `rate-limit:${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  try {
    // Get current count from Redis
    const count = await redis.incr(key);

    // Set expiry if this is the first request
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Check if rate limit exceeded
    if (count > maxRequests) {
      // Increment violation count
      await redis.incr(violationKey);
      await redis.expire(violationKey, 86400); // Violations expire after 24 hours
      
      // Apply progressive penalty
      const newViolations = violations + 1;
      const penalty = PROGRESSIVE_PENALTIES[Math.min(newViolations, 5)] || 86400;
      
      if (newViolations >= 3) {
        // Block IP after 3 violations
        await redis.setex(`blocked:${ip}`, penalty, '1');
      }
      
      const ttl = await redis.ttl(key);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: ttl,
          violations: newViolations,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': ttl.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (now + ttl * 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - count).toString());
    response.headers.set('X-RateLimit-Reset', (now + windowSeconds * 1000).toString());

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of Redis errors
    return null;
  }
}
