import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit',
});

export async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = req.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  return null;
}
