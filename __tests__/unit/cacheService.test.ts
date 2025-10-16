import { CacheService } from '@/lib/services/cacheService';

// Mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    incr: jest.fn(),
    incrby: jest.fn(),
    expire: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  })),
}));

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate consistent MD5 hash for same input', () => {
      const key1 = (CacheService as any).generateKey('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hello' },
      ]);
      const key2 = (CacheService as any).generateKey('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hello' },
      ]);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^cache:[a-f0-9]{32}$/);
    });

    it('should generate different keys for different inputs', () => {
      const key1 = (CacheService as any).generateKey('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hello' },
      ]);
      const key2 = (CacheService as any).generateKey('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hi' },
      ]);

      expect(key1).not.toBe(key2);
    });
  });

  describe('get', () => {
    it('should return cached entry if exists', async () => {
      const mockEntry = {
        response: { choices: [{ message: { content: 'Hello!' } }] },
        tokens: 10,
        cost: 0.001,
        model: 'gpt-3.5-turbo',
        timestamp: Date.now(),
      };

      // Mock Redis get to return cached entry
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;
      mockRedis.get.mockResolvedValue(mockEntry);

      const result = await CacheService.get('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toEqual(mockEntry);
    });

    it('should return null if cache miss', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;
      mockRedis.get.mockResolvedValue(null);

      const result = await CacheService.get('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await CacheService.get('openai', 'gpt-3.5-turbo', [
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should save entry to cache with TTL', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;

      await CacheService.set(
        'openai',
        'gpt-3.5-turbo',
        [{ role: 'user', content: 'Hello' }],
        { choices: [{ message: { content: 'Hi!' } }] },
        10,
        0.001,
        3600
      );

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringMatching(/^cache:[a-f0-9]{32}$/),
        3600,
        expect.any(String)
      );
    });

    it('should use default TTL of 1 hour', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;

      await CacheService.set(
        'openai',
        'gpt-3.5-turbo',
        [{ role: 'user', content: 'Hello' }],
        { choices: [] },
        10,
        0.001
      );

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.any(String),
        3600,
        expect.any(String)
      );
    });
  });

  describe('trackHit', () => {
    it('should increment hit counter on cache hit', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;

      await CacheService.trackHit(true, 0.05);

      expect(mockRedis.incr).toHaveBeenCalledWith(
        expect.stringMatching(/^stats:hits:\d{4}-\d{2}-\d{2}$/)
      );
      expect(mockRedis.incrby).toHaveBeenCalledWith(
        expect.stringMatching(/^stats:saved:\d{4}-\d{2}-\d{2}$/),
        500 // 0.05 * 10000
      );
    });

    it('should increment miss counter on cache miss', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;

      await CacheService.trackHit(false);

      expect(mockRedis.incr).toHaveBeenCalledWith(
        expect.stringMatching(/^stats:misses:\d{4}-\d{2}-\d{2}$/)
      );
    });
  });

  describe('getStats', () => {
    it('should calculate hit rate correctly', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('hits')) return Promise.resolve(80);
        if (key.includes('misses')) return Promise.resolve(20);
        if (key.includes('saved')) return Promise.resolve(50000); // $5.00
        return Promise.resolve(0);
      });

      const stats = await CacheService.getStats(1);

      expect(stats.hits).toBe(80);
      expect(stats.misses).toBe(20);
      expect(stats.hitRate).toBe(80);
      expect(stats.savedCost).toBe(5);
    });

    it('should handle zero requests', async () => {
      const mockRedis = require('@upstash/redis').Redis.mock.results[0].value;
      mockRedis.get.mockResolvedValue(0);

      const stats = await CacheService.getStats(1);

      expect(stats.hitRate).toBe(0);
    });
  });

  describe('isEnabled', () => {
    it('should return true when Redis is configured', () => {
      expect(CacheService.isEnabled()).toBe(true);
    });
  });
});
