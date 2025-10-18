import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis/Upstash in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS = {
  default: { requests: 100, window: 60000 }, // 100 req/min
  strict: { requests: 10, window: 60000 },   // 10 req/min
  generous: { requests: 1000, window: 60000 }, // 1000 req/min
};

export function rateLimit(
  req: NextRequest,
  limit: keyof typeof RATE_LIMITS = 'default'
): NextResponse | null {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const { requests, window } = RATE_LIMITS[limit];

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window });
    return null;
  }

  if (record.count >= requests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(requests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(record.resetTime),
        }
      }
    );
  }

  record.count++;
  return null;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);
