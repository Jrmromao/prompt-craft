import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiters for different endpoints
export const rateLimiters = {
  stripeApi: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    prefix: 'ratelimit:stripe',
  }),
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:webhook',
  }),
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
    prefix: 'ratelimit:general',
  }),
}; 