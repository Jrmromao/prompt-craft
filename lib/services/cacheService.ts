import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

interface CacheEntry {
  response: any;
  tokens: number;
  cost: number;
  model: string;
  timestamp: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  savedCost: number;
}

export class CacheService {
  private static generateKey(provider: string, model: string, messages: any[]): string {
    const content = JSON.stringify({ provider, model, messages });
    return `cache:${crypto.createHash('md5').update(content).digest('hex')}`;
  }

  static async get(provider: string, model: string, messages: any[]): Promise<CacheEntry | null> {
    if (!redis) return null;

    try {
      const key = this.generateKey(provider, model, messages);
      const cached = await redis.get<CacheEntry>(key);
      
      if (cached) {
        // Track cache hit
        await this.trackHit(true, cached.cost);
      }
      
      return cached;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(
    provider: string,
    model: string,
    messages: any[],
    response: any,
    tokens: number,
    cost: number,
    ttl: number = 3600 // 1 hour default
  ): Promise<void> {
    if (!redis) return;

    try {
      const key = this.generateKey(provider, model, messages);
      const entry: CacheEntry = {
        response,
        tokens,
        cost,
        model,
        timestamp: Date.now(),
      };

      await redis.setex(key, ttl, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async trackHit(isHit: boolean, savedCost: number = 0): Promise<void> {
    if (!redis) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const hitKey = `stats:hits:${today}`;
      const missKey = `stats:misses:${today}`;
      const costKey = `stats:saved:${today}`;

      if (isHit) {
        await redis.incr(hitKey);
        await redis.incrby(costKey, Math.round(savedCost * 10000)); // Store as cents
      } else {
        await redis.incr(missKey);
      }

      // Expire after 90 days
      await redis.expire(hitKey, 90 * 24 * 60 * 60);
      await redis.expire(missKey, 90 * 24 * 60 * 60);
      await redis.expire(costKey, 90 * 24 * 60 * 60);
    } catch (error) {
      console.error('Cache track error:', error);
    }
  }

  static async getStats(days: number = 30): Promise<CacheStats> {
    if (!redis) {
      return { hits: 0, misses: 0, hitRate: 0, savedCost: 0 };
    }

    try {
      let totalHits = 0;
      let totalMisses = 0;
      let totalSaved = 0;

      const promises = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        promises.push(
          redis.get<number>(`stats:hits:${dateStr}`).then(v => totalHits += v || 0),
          redis.get<number>(`stats:misses:${dateStr}`).then(v => totalMisses += v || 0),
          redis.get<number>(`stats:saved:${dateStr}`).then(v => totalSaved += v || 0)
        );
      }

      await Promise.all(promises);

      const total = totalHits + totalMisses;
      const hitRate = total > 0 ? (totalHits / total) * 100 : 0;
      const savedCost = totalSaved / 10000; // Convert back from cents

      return {
        hits: totalHits,
        misses: totalMisses,
        hitRate: Math.round(hitRate * 10) / 10,
        savedCost: Math.round(savedCost * 100) / 100,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { hits: 0, misses: 0, hitRate: 0, savedCost: 0 };
    }
  }

  static async clear(): Promise<void> {
    if (!redis) return;

    try {
      // Clear all cache keys (this is expensive, use sparingly)
      const keys = await redis.keys('cache:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  static isEnabled(): boolean {
    return redis !== null;
  }
}
