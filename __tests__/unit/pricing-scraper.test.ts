/**
 * Unit tests for PricingScraper
 */

import { PricingScraper } from '../../lib/pricing-scraper';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  modelPricing: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
} as any;

(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

// Mock fetch
global.fetch = jest.fn();

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    text: jest.fn(() => 'Sample pricing text'),
    find: jest.fn(() => ({
      each: jest.fn(),
      text: jest.fn(() => 'gpt-4 $30 input $60 output'),
    })),
  })),
}));

describe('PricingScraper', () => {
  let scraper: PricingScraper;

  beforeEach(() => {
    scraper = new PricingScraper();
    jest.clearAllMocks();
  });

  describe('parseDeepSeekPricing', () => {
    it('should return correct DeepSeek pricing data', () => {
      const mockCheerio = {
        text: jest.fn(() => ''),
        find: jest.fn(() => ({
          each: jest.fn(),
        })),
      };

      const models = ['deepseek-chat', 'deepseek-reasoner'];
      const result = scraper['parseDeepSeekPricing'](mockCheerio as any, models);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        model: 'deepseek-chat',
        provider: 'deepseek',
        inputCost: 0.28,
        outputCost: 0.42,
        averageCost: 0.35,
        cacheHit: true,
        cacheHitCost: 0.028,
        metadata: {
          source: 'deepseek_official_docs',
          lastVerified: expect.any(String),
        },
      });
    });
  });

  describe('extractPrice', () => {
    it('should extract price from text with $ symbol', () => {
      const mockRow = {
        text: jest.fn(() => 'gpt-4 $30 input $60 output'),
      };

      const result = scraper['extractPrice'](mockRow as any, 'input');
      expect(result).toBe(30);
    });

    it('should return 0 for text without price', () => {
      const mockRow = {
        text: jest.fn(() => 'no price here'),
      };

      const result = scraper['extractPrice'](mockRow as any, 'input');
      expect(result).toBe(0);
    });
  });

  describe('savePricingData', () => {
    it('should save pricing data to database', async () => {
      const pricingData = [
        {
          model: 'gpt-4',
          provider: 'openai',
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
        },
      ];

      mockPrisma.modelPricing.upsert.mockResolvedValue({});

      await scraper['savePricingData'](pricingData);

      expect(mockPrisma.modelPricing.upsert).toHaveBeenCalledWith({
        where: { model: 'gpt-4' },
        update: {
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
          region: undefined,
          cacheHit: false,
          cacheHitCost: undefined,
          lastUpdated: expect.any(Date),
          source: 'scraper',
          metadata: undefined,
        },
        create: {
          model: 'gpt-4',
          provider: 'openai',
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
          region: undefined,
          cacheHit: false,
          cacheHitCost: undefined,
          source: 'scraper',
          metadata: undefined,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const pricingData = [
        {
          model: 'gpt-4',
          provider: 'openai',
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
        },
      ];

      mockPrisma.modelPricing.upsert.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(scraper['savePricingData'](pricingData)).resolves.not.toThrow();
    });
  });

  describe('getCurrentPricing', () => {
    it('should return current pricing from database', async () => {
      const mockPricing = [
        {
          model: 'gpt-4',
          provider: 'openai',
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
          region: null,
          cacheHit: false,
          cacheHitCost: null,
          metadata: null,
        },
      ];

      mockPrisma.modelPricing.findMany.mockResolvedValue(mockPricing);

      const result = await scraper.getCurrentPricing();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        model: 'gpt-4',
        provider: 'openai',
        inputCost: 30,
        outputCost: 60,
        averageCost: 45,
        region: undefined,
        cacheHit: false,
        cacheHitCost: undefined,
        metadata: null,
      });
    });
  });

  describe('getModelPricing', () => {
    it('should return pricing for specific model', async () => {
      const mockPricing = {
        model: 'gpt-4',
        provider: 'openai',
        inputCost: 30,
        outputCost: 60,
        averageCost: 45,
        region: null,
        cacheHit: false,
        cacheHitCost: null,
        metadata: null,
      };

      mockPrisma.modelPricing.findFirst.mockResolvedValue(mockPricing);

      const result = await scraper.getModelPricing('gpt-4');

      expect(result).toEqual({
        model: 'gpt-4',
        provider: 'openai',
        inputCost: 30,
        outputCost: 60,
        averageCost: 45,
        region: undefined,
        cacheHit: false,
        cacheHitCost: undefined,
        metadata: null,
      });
    });

    it('should return null if model not found', async () => {
      mockPrisma.modelPricing.findFirst.mockResolvedValue(null);

      const result = await scraper.getModelPricing('nonexistent-model');

      expect(result).toBeNull();
    });
  });

  describe('cleanupOldPricing', () => {
    it('should delete old pricing data', async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      mockPrisma.modelPricing.deleteMany.mockResolvedValue({ count: 5 });

      await scraper.cleanupOldPricing(30);

      expect(mockPrisma.modelPricing.deleteMany).toHaveBeenCalledWith({
        where: {
          lastUpdated: { lt: expect.any(Date) },
          source: 'scraper',
        },
      });
    });
  });

  describe('scrapeProviderPricing', () => {
    it('should handle successful fetch', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('<html>pricing data</html>'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Mock the parseProviderPricing method
      jest.spyOn(scraper as any, 'parseProviderPricing').mockReturnValue([
        {
          model: 'gpt-4',
          provider: 'openai',
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
        },
      ]);

      const result = await scraper['scrapeProviderPricing']('openai', {
        name: 'OpenAI',
        pricingUrl: 'https://openai.com/pricing',
        models: ['gpt-4'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].model).toBe('gpt-4');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await scraper['scrapeProviderPricing']('openai', {
        name: 'OpenAI',
        pricingUrl: 'https://openai.com/pricing',
        models: ['gpt-4'],
      });

      expect(result).toEqual([]);
    });

    it('should handle non-ok responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await scraper['scrapeProviderPricing']('openai', {
        name: 'OpenAI',
        pricingUrl: 'https://openai.com/pricing',
        models: ['gpt-4'],
      });

      expect(result).toEqual([]);
    });
  });
});
