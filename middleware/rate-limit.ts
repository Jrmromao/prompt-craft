import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client for distributed rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS = 100; // Maximum requests per window
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB in bytes

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

  // Get IP from headers or use a fallback
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'anonymous';

  // Use Redis for distributed rate limiting
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  try {
    // Get current count from Redis
    const count = await redis.incr(key);

    // Set expiry if this is the first request
    if (count === 1) {
      await redis.expire(key, Math.ceil(RATE_LIMIT_WINDOW / 1000));
    }

    // Check if rate limit exceeded
    if (count > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
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

    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of Redis errors
    return null;
  }
}
