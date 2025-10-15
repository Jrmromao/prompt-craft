import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { CacheService } from '@/lib/services/cacheService';
import { trackRunSchema, createAlertSchema } from '@/lib/validation/schemas';

jest.mock('@/lib/redis', () => ({
  redis: {
    incr: jest.fn(),
    expire: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));

describe('Security & Performance', () => {
  describe('Rate Limiting', () => {
    it('should allow requests under limit', async () => {
      const { redis } = require('@/lib/redis');
      redis.incr.mockResolvedValue(5);

      const result = await checkRateLimit('user1', 'PRO');
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests over limit', async () => {
      const { redis } = require('@/lib/redis');
      redis.incr.mockResolvedValue(301);

      const result = await checkRateLimit('user1', 'PRO');
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should enforce different limits per plan', async () => {
      const { redis } = require('@/lib/redis');
      
      redis.incr.mockResolvedValue(15);
      const free = await checkRateLimit('user1', 'FREE');
      expect(free.allowed).toBe(false);

      redis.incr.mockResolvedValue(15);
      const starter = await checkRateLimit('user2', 'STARTER');
      expect(starter.allowed).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate track run data', () => {
      const valid = trackRunSchema.safeParse({
        promptId: 'test',
        model: 'gpt-4',
        provider: 'openai',
        input: 'Hello',
        output: 'Hi',
        tokensUsed: 10,
        latency: 1000,
        success: true,
      });

      expect(valid.success).toBe(true);
    });

    it('should reject invalid provider', () => {
      const invalid = trackRunSchema.safeParse({
        promptId: 'test',
        model: 'gpt-4',
        provider: 'invalid',
        input: 'Hello',
        output: 'Hi',
        tokensUsed: 10,
        latency: 1000,
        success: true,
      });

      expect(invalid.success).toBe(false);
    });

    it('should reject oversized input', () => {
      const invalid = trackRunSchema.safeParse({
        promptId: 'test',
        model: 'gpt-4',
        provider: 'openai',
        input: 'x'.repeat(60000),
        output: 'Hi',
        tokensUsed: 10,
        latency: 1000,
        success: true,
      });

      expect(invalid.success).toBe(false);
    });

    it('should validate alert creation', () => {
      const valid = createAlertSchema.safeParse({
        type: 'COST_SPIKE',
        threshold: 100,
      });

      expect(valid.success).toBe(true);
    });
  });

  describe('Caching', () => {
    let cache: CacheService;

    beforeEach(() => {
      cache = CacheService.getInstance();
      jest.clearAllMocks();
    });

    it('should cache and retrieve data', async () => {
      const { redis } = require('@/lib/redis');
      const testData = { value: 'test' };
      
      redis.setex.mockResolvedValue('OK');
      await cache.set('test-key', testData);
      
      redis.get.mockResolvedValue(JSON.stringify(testData));
      const result = await cache.get('test-key');
      
      expect(result).toEqual(testData);
    });

    it('should return null for cache miss', async () => {
      const { redis } = require('@/lib/redis');
      redis.get.mockResolvedValue(null);

      const result = await cache.get('missing-key');
      
      expect(result).toBeNull();
    });

    it('should invalidate cache pattern', async () => {
      const { redis } = require('@/lib/redis');
      redis.keys.mockResolvedValue(['key1', 'key2']);
      redis.del.mockResolvedValue(2);

      await cache.invalidatePattern('analytics:*');
      
      expect(redis.del).toHaveBeenCalledWith('key1', 'key2');
    });
  });
});
