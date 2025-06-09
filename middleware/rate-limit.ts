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
const MAX_REQUESTS = 60; // Maximum requests per window (1 request per second)
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB in bytes

// Different rate limits for different routes
const ROUTE_LIMITS = {
  default: 60, // 1 request per second
  comments: 30, // 1 request every 2 seconds
  votes: 20, // 1 request every 3 seconds
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
  if (request.nextUrl.pathname.includes('/comments')) {
    maxRequests = ROUTE_LIMITS.comments;
  } else if (request.nextUrl.pathname.includes('/vote')) {
    maxRequests = ROUTE_LIMITS.votes;
  }

  // Use Redis for distributed rate limiting
  const key = `rate-limit:${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  try {
    // Get current count from Redis
    const count = await redis.incr(key);

    // Set expiry if this is the first request
    if (count === 1) {
      await redis.expire(key, Math.ceil(RATE_LIMIT_WINDOW / 1000));
    }

    // Check if rate limit exceeded
    if (count > maxRequests) {
      const ttl = await redis.ttl(key);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: ttl,
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
    response.headers.set('X-RateLimit-Reset', (now + RATE_LIMIT_WINDOW).toString());

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of Redis errors
    return null;
  }
}
