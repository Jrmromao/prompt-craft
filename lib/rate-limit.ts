import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
  };
}

// Rate limit by IP
export async function rateLimitByIp(ip: string) {
  return rateLimit(`ratelimit_${ip}`);
}

// Rate limit by user ID
export async function rateLimitByUserId(userId: string) {
  return rateLimit(`ratelimit_user_${userId}`);
}

// Rate limit by API key
export async function rateLimitByApiKey(apiKey: string) {
  return rateLimit(`ratelimit_api_${apiKey}`);
} 