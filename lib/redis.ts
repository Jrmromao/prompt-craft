import { Redis } from '@upstash/redis';

export const redis = process.env.NODE_ENV === 'test'
  ? new Redis({ url: 'http://localhost:8079', token: 'test' })
  : process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : new Redis({ url: 'http://localhost:8079', token: 'test' });
