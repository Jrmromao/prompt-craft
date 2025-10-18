/**
 * Unit tests for Pricing API endpoints
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '../../app/api/pricing/scrape/route';

// Mock the pricing scraper
jest.mock('../../lib/pricing-scraper', () => ({
  pricingScraper: {
    scrapeAllPricing: jest.fn(),
    scrapeProviderPricing: jest.fn(),
    cleanupOldPricing: jest.fn(),
    getCurrentPricing: jest.fn(),
  },
}));

import { pricingScraper } from '../../lib/pricing-scraper';

const mockPricingScraper = pricingScraper as jest.Mocked<typeof pricingScraper>;

describe.skip('Pricing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/pricing/scrape', () => {
    it('should scrape all providers when no provider specified', async () => {
      mockPricingScraper.scrapeAllPricing.mockResolvedValue();
      mockPricingScraper.cleanupOldPricing.mockResolvedValue();

      const request = new Request('http://localhost:3000/api/pricing/scrape', {
        method: 'POST',
        body: JSON.stringify({}),
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Pricing scrape completed successfully');
      expect(mockPricingScraper.scrapeAllPricing).toHaveBeenCalled();
      expect(mockPricingScraper.cleanupOldPricing).toHaveBeenCalledWith(30);
    });

    it('should scrape specific provider when provided', async () => {
      mockPricingScraper.scrapeProviderPricing.mockResolvedValue();
      mockPricingScraper.cleanupOldPricing.mockResolvedValue();

      const request = new Request('http://localhost:3000/api/pricing/scrape', {
        method: 'POST',
        body: JSON.stringify({ provider: 'openai' }),
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPricingScraper.scrapeProviderPricing).toHaveBeenCalledWith('openai', expect.any(Object));
    });

    it('should handle scraping errors', async () => {
      mockPricingScraper.scrapeAllPricing.mockRejectedValue(new Error('Scraping failed'));

      const request = new Request('http://localhost:3000/api/pricing/scrape', {
        method: 'POST',
        body: JSON.stringify({}),
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to scrape pricing data');
      expect(data.details).toBe('Scraping failed');
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/pricing/scrape', {
        method: 'POST',
        body: 'invalid json',
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPricingScraper.scrapeAllPricing).toHaveBeenCalled();
    });
  });

  describe('GET /api/pricing/scrape', () => {
    it('should return current pricing data', async () => {
      const mockPricing = [
        {
          model: 'gpt-4',
          provider: 'openai',
          inputCost: 30,
          outputCost: 60,
          averageCost: 45,
          region: undefined,
          cacheHit: false,
          cacheHitCost: undefined,
          metadata: null,
        },
      ];

      mockPricingScraper.getCurrentPricing.mockResolvedValue(mockPricing);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPricing);
      expect(data.count).toBe(1);
      expect(data.timestamp).toBeDefined();
    });

    it('should handle database errors', async () => {
      mockPricingScraper.getCurrentPricing.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch pricing data');
      expect(data.details).toBe('Database error');
    });

    it('should return empty array when no pricing data', async () => {
      mockPricingScraper.getCurrentPricing.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
    });
  });
});
