/**
 * Integration tests for Pricing System
 */

import { PrismaClient } from '@prisma/client';
import { PricingScraper } from '../../lib/pricing-scraper';

// Mock fetch for external API calls
global.fetch = jest.fn();

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    text: jest.fn(() => 'Sample pricing text'),
    find: jest.fn(() => ({
      each: jest.fn((callback) => {
        // Simulate table rows with pricing data
        const mockRows = [
          { text: () => 'gpt-4 $30 input $60 output' },
          { text: () => 'gpt-3.5-turbo $0.5 input $1.5 output' },
        ];
        mockRows.forEach(callback);
      }),
    })),
  })),
}));

describe('Pricing System Integration', () => {
  let prisma: PrismaClient;
  let scraper: PricingScraper;

  beforeAll(async () => {
    prisma = new PrismaClient();
    scraper = new PricingScraper();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.modelPricing.deleteMany({
      where: { source: 'test' },
    });
  });

  describe('Database Operations', () => {
    it('should save and retrieve pricing data', async () => {
      const testPricing = {
        model: 'test-model',
        provider: 'test-provider',
        inputCost: 10,
        outputCost: 20,
        averageCost: 15,
        source: 'test',
        metadata: { test: true },
      };

      // Save pricing data
      await prisma.modelPricing.create({
        data: testPricing,
      });

      // Retrieve pricing data
      const savedPricing = await prisma.modelPricing.findFirst({
        where: { model: 'test-model' },
      });

      expect(savedPricing).toBeDefined();
      expect(savedPricing?.model).toBe('test-model');
      expect(savedPricing?.provider).toBe('test-provider');
      expect(savedPricing?.inputCost).toBe(10);
      expect(savedPricing?.outputCost).toBe(20);
      expect(savedPricing?.averageCost).toBe(15);
    });

    it('should update existing pricing data', async () => {
      const initialPricing = {
        model: 'test-model-2',
        provider: 'test-provider',
        inputCost: 10,
        outputCost: 20,
        averageCost: 15,
        source: 'test',
      };

      // Create initial pricing
      await prisma.modelPricing.create({
        data: initialPricing,
      });

      // Update pricing
      const updatedPricing = await prisma.modelPricing.update({
        where: { model: 'test-model-2' },
        data: {
          inputCost: 15,
          outputCost: 25,
          averageCost: 20,
          lastUpdated: new Date(),
        },
      });

      expect(updatedPricing.inputCost).toBe(15);
      expect(updatedPricing.outputCost).toBe(25);
      expect(updatedPricing.averageCost).toBe(20);
    });

    it('should handle upsert operations', async () => {
      const pricingData = {
        model: 'test-model-3',
        provider: 'test-provider',
        inputCost: 5,
        outputCost: 10,
        averageCost: 7.5,
        source: 'test',
      };

      // First upsert (create)
      await prisma.modelPricing.upsert({
        where: { model: 'test-model-3' },
        update: pricingData,
        create: pricingData,
      });

      let savedPricing = await prisma.modelPricing.findFirst({
        where: { model: 'test-model-3' },
      });

      expect(savedPricing?.inputCost).toBe(5);

      // Second upsert (update)
      const updatedData = { ...pricingData, inputCost: 8, averageCost: 9 };
      await prisma.modelPricing.upsert({
        where: { model: 'test-model-3' },
        update: updatedData,
        create: updatedData,
      });

      savedPricing = await prisma.modelPricing.findFirst({
        where: { model: 'test-model-3' },
      });

      expect(savedPricing?.inputCost).toBe(8);
    });
  });

  describe('Pricing Scraper Integration', () => {
    it('should parse and save DeepSeek pricing', async () => {
      const mockCheerio = {
        text: jest.fn(() => ''),
        find: jest.fn(() => ({
          each: jest.fn(),
        })),
      };

      const models = ['deepseek-chat'];
      const pricingData = scraper['parseDeepSeekPricing'](mockCheerio as any, models);

      expect(pricingData).toHaveLength(1);
      expect(pricingData[0].model).toBe('deepseek-chat');
      expect(pricingData[0].provider).toBe('deepseek');
      expect(pricingData[0].inputCost).toBe(0.28);
      expect(pricingData[0].outputCost).toBe(0.42);
      expect(pricingData[0].averageCost).toBe(0.35);
    });

    it('should extract prices from text correctly', () => {
      const mockRow = {
        text: jest.fn(() => 'gpt-4 $30 input $60 output per 1M tokens'),
      };

      const inputPrice = scraper['extractPrice'](mockRow as any, 'input');
      const outputPrice = scraper['extractPrice'](mockRow as any, 'output');

      expect(inputPrice).toBe(30);
      expect(outputPrice).toBe(60);
    });

    it('should handle price extraction edge cases', () => {
      const mockRowNoPrice = {
        text: jest.fn(() => 'no pricing information here'),
      };

      const mockRowInvalidPrice = {
        text: jest.fn(() => 'gpt-4 $invalid input $60 output'),
      };

      expect(scraper['extractPrice'](mockRowNoPrice as any, 'input')).toBe(0);
      expect(scraper['extractPrice'](mockRowInvalidPrice as any, 'input')).toBe(0);
    });
  });

  describe('API Integration', () => {
    it('should handle successful pricing scrape', async () => {
      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<html>pricing data</html>'),
      });

      // Mock the parseProviderPricing method to return test data
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
      expect(result[0].provider).toBe('openai');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await scraper['scrapeProviderPricing']('openai', {
        name: 'OpenAI',
        pricingUrl: 'https://openai.com/pricing',
        models: ['gpt-4'],
      });

      expect(result).toEqual([]);
    });
  });

  describe('Data Cleanup', () => {
    it('should clean up old pricing data', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5); // 5 days ago

      // Create old pricing data
      await prisma.modelPricing.create({
        data: {
          model: 'old-model',
          provider: 'test-provider',
          inputCost: 10,
          outputCost: 20,
          averageCost: 15,
          source: 'test',
          lastUpdated: oldDate,
        },
      });

      // Create recent pricing data
      await prisma.modelPricing.create({
        data: {
          model: 'recent-model',
          provider: 'test-provider',
          inputCost: 10,
          outputCost: 20,
          averageCost: 15,
          source: 'test',
          lastUpdated: recentDate,
        },
      });

      // Clean up data older than 30 days
      await prisma.modelPricing.deleteMany({
        where: {
          lastUpdated: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          source: 'test',
        },
      });

      // Check that old data is deleted but recent data remains
      const oldData = await prisma.modelPricing.findFirst({
        where: { model: 'old-model' },
      });
      const recentData = await prisma.modelPricing.findFirst({
        where: { model: 'recent-model' },
      });

      expect(oldData).toBeNull();
      expect(recentData).toBeDefined();
    });
  });
});
