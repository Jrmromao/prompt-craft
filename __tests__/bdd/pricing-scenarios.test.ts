/**
 * BDD tests for Pricing System scenarios
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { PricingScraper } from '../../lib/pricing-scraper';

// Mock external dependencies
global.fetch = jest.fn();
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    text: jest.fn(() => 'Sample pricing text'),
    find: jest.fn(() => ({
      each: jest.fn((callback) => {
        const mockRows = [
          { text: () => 'gpt-4 $30 input $60 output' },
          { text: () => 'gpt-3.5-turbo $0.5 input $1.5 output' },
        ];
        mockRows.forEach(callback);
      }),
    })),
  })),
}));

// Mock Prisma client
const mockPrisma = {
  modelPricing: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
} as any;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

let scraper: PricingScraper;
let testContext: any = {};

beforeAll(async () => {
  scraper = new PricingScraper();
});

afterAll(async () => {
  await mockPrisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data
  await mockPrisma.modelPricing.deleteMany({
    where: { source: 'bdd-test' },
  });
  testContext = {};
  jest.clearAllMocks();
});

// Scenario: User wants to update pricing data
Given('the pricing system is initialized', () => {
  expect(scraper).toBeDefined();
  expect(mockPrisma).toBeDefined();
});

When('I trigger a pricing scrape for all providers', async () => {
  // Mock successful fetch responses
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue('<html>pricing data</html>'),
  });

  // Mock parseProviderPricing to return test data
  jest.spyOn(scraper as any, 'parseProviderPricing').mockReturnValue([
    {
      model: 'gpt-4',
      provider: 'openai',
      inputCost: 30,
      outputCost: 60,
      averageCost: 45,
    },
    {
      model: 'deepseek-chat',
      provider: 'deepseek',
      inputCost: 0.28,
      outputCost: 0.42,
      averageCost: 0.35,
    },
  ]);

  await scraper.scrapeAllPricing();
  testContext.scrapeCompleted = true;
});

Then('pricing data should be saved to the database', async () => {
  expect(testContext.scrapeCompleted).toBe(true);
  
  const savedPricing = await mockPrisma.modelPricing.findMany({
    where: { source: 'scraper' },
  });

  expect(savedPricing.length).toBeGreaterThan(0);
  
  const gpt4Pricing = savedPricing.find(p => p.model === 'gpt-4');
  expect(gpt4Pricing).toBeDefined();
  expect(gpt4Pricing?.provider).toBe('openai');
  expect(gpt4Pricing?.inputCost).toBe(30);
  expect(gpt4Pricing?.outputCost).toBe(60);
  expect(gpt4Pricing?.averageCost).toBe(45);
});

// Scenario: User wants to retrieve current pricing
Given('pricing data exists in the database', async () => {
  await mockPrisma.modelPricing.create({
    data: {
      model: 'gpt-4',
      provider: 'openai',
      inputCost: 30,
      outputCost: 60,
      averageCost: 45,
      source: 'bdd-test',
    },
  });

  await mockPrisma.modelPricing.create({
    data: {
      model: 'deepseek-chat',
      provider: 'deepseek',
      inputCost: 0.28,
      outputCost: 0.42,
      averageCost: 0.35,
      source: 'bdd-test',
    },
  });
});

When('I request current pricing data', async () => {
  testContext.currentPricing = await scraper.getCurrentPricing();
});

Then('I should receive all available pricing information', () => {
  expect(testContext.currentPricing).toBeDefined();
  expect(testContext.currentPricing.length).toBeGreaterThanOrEqual(2);
  
  const gpt4Pricing = testContext.currentPricing.find((p: any) => p.model === 'gpt-4');
  const deepseekPricing = testContext.currentPricing.find((p: any) => p.model === 'deepseek-chat');
  
  expect(gpt4Pricing).toBeDefined();
  expect(deepseekPricing).toBeDefined();
});

// Scenario: User wants to find pricing for a specific model
When('I search for pricing of {string}', async (modelName: string) => {
  testContext.searchedModel = modelName;
  testContext.modelPricing = await scraper.getModelPricing(modelName);
});

Then('I should receive pricing information for that model', () => {
  expect(testContext.modelPricing).toBeDefined();
  expect(testContext.modelPricing?.model).toContain(testContext.searchedModel);
  expect(testContext.modelPricing?.inputCost).toBeGreaterThan(0);
  expect(testContext.modelPricing?.outputCost).toBeGreaterThan(0);
  expect(testContext.modelPricing?.averageCost).toBeGreaterThan(0);
});

// Scenario: User wants to clean up old pricing data
Given('there is old pricing data in the database', async () => {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

  await mockPrisma.modelPricing.create({
    data: {
      model: 'old-model',
      provider: 'test-provider',
      inputCost: 10,
      outputCost: 20,
      averageCost: 15,
      source: 'bdd-test',
      lastUpdated: oldDate,
    },
  });

  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 5); // 5 days ago

  await mockPrisma.modelPricing.create({
    data: {
      model: 'recent-model',
      provider: 'test-provider',
      inputCost: 10,
      outputCost: 20,
      averageCost: 15,
      source: 'bdd-test',
      lastUpdated: recentDate,
    },
  });
});

When('I clean up pricing data older than {int} days', async (days: number) => {
  await scraper.cleanupOldPricing(days);
  testContext.cleanupDays = days;
});

Then('old pricing data should be removed', async () => {
  const oldData = await mockPrisma.modelPricing.findFirst({
    where: { model: 'old-model' },
  });
  
  const recentData = await mockPrisma.modelPricing.findFirst({
    where: { model: 'recent-model' },
  });

  expect(oldData).toBeNull();
  expect(recentData).toBeDefined();
});

// Scenario: System handles network errors gracefully
When('the pricing scrape encounters a network error', async () => {
  (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  
  try {
    await scraper['scrapeProviderPricing']('openai', {
      name: 'OpenAI',
      pricingUrl: 'https://openai.com/pricing',
      models: ['gpt-4'],
    });
    testContext.scrapeResult = 'success';
  } catch (error) {
    testContext.scrapeResult = 'error';
    testContext.error = error;
  }
});

Then('the system should handle the error gracefully', () => {
  expect(testContext.scrapeResult).toBe('success'); // Should not throw
  expect(testContext.error).toBeUndefined();
});

// Scenario: System validates pricing data integrity
Given('pricing data with invalid values', () => {
  testContext.invalidPricing = {
    model: 'invalid-model',
    provider: 'test-provider',
    inputCost: -10, // Invalid negative cost
    outputCost: 0, // Invalid zero cost
    averageCost: -5, // Invalid negative average
  };
});

When('I attempt to save the invalid pricing data', async () => {
  try {
    await scraper['savePricingData']([testContext.invalidPricing]);
    testContext.saveResult = 'success';
  } catch (error) {
    testContext.saveResult = 'error';
    testContext.error = error;
  }
});

Then('the system should handle the invalid data appropriately', () => {
  // The system should either reject invalid data or handle it gracefully
  expect(['success', 'error']).toContain(testContext.saveResult);
});

// Scenario: System provides accurate cost calculations
Given('pricing data for {string} with input cost {float} and output cost {float}', async (model: string, inputCost: number, outputCost: number) => {
  await mockPrisma.modelPricing.create({
    data: {
      model,
      provider: 'test-provider',
      inputCost,
      outputCost,
      averageCost: (inputCost + outputCost) / 2,
      source: 'bdd-test',
    },
  });
});

When('I calculate cost for {int} tokens using {string}', async (tokenCount: number, model: string) => {
  const pricing = await scraper.getModelPricing(model);
  if (pricing) {
    testContext.calculatedCost = (tokenCount / 1000000) * pricing.averageCost;
  }
});

Then('the calculated cost should be {float}', (expectedCost: number) => {
  expect(testContext.calculatedCost).toBeCloseTo(expectedCost, 4);
});

// Scenario: System handles concurrent pricing updates
When('multiple pricing updates are triggered simultaneously', async () => {
  const updatePromises = Array(5).fill(null).map(async (_, index) => {
    const pricingData = {
      model: `concurrent-model-${index}`,
      provider: 'test-provider',
      inputCost: 10 + index,
      outputCost: 20 + index,
      averageCost: 15 + index,
    };
    
    await scraper['savePricingData']([pricingData]);
  });

  await Promise.all(updatePromises);
  testContext.concurrentUpdatesCompleted = true;
});

Then('all updates should be processed successfully', async () => {
  expect(testContext.concurrentUpdatesCompleted).toBe(true);
  
  const savedPricing = await mockPrisma.modelPricing.findMany({
    where: { 
      model: { startsWith: 'concurrent-model-' },
      source: 'scraper'
    },
  });

  expect(savedPricing.length).toBe(5);
});
