import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds in milliseconds
const MAX_REQUESTS = 10; // Maximum requests per window

export function rateLimitMiddleware(request: NextRequest) {
  // Get IP from headers or use a fallback
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'anonymous';
  const now = Date.now();
  
  // Get or initialize rate limit data for this IP
  const rateLimitData = rateLimitStore.get(ip) ?? { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Reset if window has passed
  if (now > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  // Increment request count
  rateLimitData.count++;
  rateLimitStore.set(ip, rateLimitData);
  
  // Check if rate limit exceeded
  if (rateLimitData.count > MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
      },
    });
  }
  
  return null;
} 