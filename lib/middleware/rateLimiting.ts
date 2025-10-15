import { redis } from '@/lib/redis';

const RATE_LIMITS = {
  FREE: { requests: 10, window: 60 },
  STARTER: { requests: 60, window: 60 },
  PRO: { requests: 300, window: 60 },
  ENTERPRISE: { requests: 1000, window: 60 },
};

export async function checkRateLimit(userId: string, planType: string): Promise<{ allowed: boolean; remaining: number }> {
  const limit = RATE_LIMITS[planType as keyof typeof RATE_LIMITS] || RATE_LIMITS.FREE;
  const key = `ratelimit:${userId}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, limit.window);
  }

  return {
    allowed: current <= limit.requests,
    remaining: Math.max(0, limit.requests - current),
  };
}
