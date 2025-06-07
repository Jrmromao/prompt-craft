import { Redis } from '@upstash/redis';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

export class RateLimiter {
  private redis: Redis;
  private windowMs: number;
  private max: number;

  constructor(options: RateLimiterOptions) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
    this.windowMs = options.windowMs;
    this.max = options.max;
  }

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`;

    try {
      const current = await this.redis.incr(windowKey);
      if (current === 1) {
        await this.redis.expire(windowKey, Math.ceil(this.windowMs / 1000));
      }

      return current > this.max;
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow the request if rate limiting fails
      return false;
    }
  }

  async reset(key: string): Promise<void> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`;
    await this.redis.del(windowKey);
  }
} 