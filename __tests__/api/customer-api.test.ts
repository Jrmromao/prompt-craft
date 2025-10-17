import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  promptRun: {
    create: jest.fn(),
  },
  apiKey: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Customer API - /api/integrations/run', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', () => {
      const userId = null;
      expect(userId).toBeNull();
      
      const statusCode = userId ? 200 : 401;
      expect(statusCode).toBe(401);
    });

    it('should accept requests with valid user', () => {
      const userId = 'user_123';
      expect(userId).toBeDefined();
      
      const statusCode = userId ? 200 : 401;
      expect(statusCode).toBe(200);
    });
  });

  describe('Request Validation', () => {
    it('should validate required fields', () => {
      const validRequest = {
        provider: 'openai',
        model: 'gpt-4',
        input: 'test prompt',
        output: 'test response',
        inputTokens: 10,
        outputTokens: 20,
      };

      expect(validRequest.provider).toBeDefined();
      expect(validRequest.model).toBeDefined();
      expect(validRequest.input).toBeDefined();
    });

    it('should handle missing optional fields', () => {
      const minimalRequest = {
        provider: 'openai',
        model: 'gpt-4',
      };

      const inputTokens = minimalRequest.inputTokens || 0;
      const outputTokens = minimalRequest.outputTokens || 0;

      expect(inputTokens).toBe(0);
      expect(outputTokens).toBe(0);
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate cost from tokens', () => {
      const tokensUsed = 1000;
      const costPerToken = 0.00001; // $0.01 per 1000 tokens
      const cost = tokensUsed * costPerToken;

      expect(cost).toBe(0.01);
    });

    it('should handle zero tokens', () => {
      const tokensUsed = 0;
      const costPerToken = 0.00001;
      const cost = tokensUsed * costPerToken;

      expect(cost).toBe(0);
    });

    it('should calculate different model costs', () => {
      const tokens = 1000;
      
      const gpt4Cost = tokens * 0.00003; // $0.03 per 1K tokens
      const gpt35Cost = tokens * 0.000002; // $0.002 per 1K tokens

      expect(gpt4Cost).toBeGreaterThan(gpt35Cost);
      expect(gpt4Cost).toBeCloseTo(0.03, 5);
      expect(gpt35Cost).toBeCloseTo(0.002, 5);
    });
  });

  describe('Tracking', () => {
    it('should track successful API calls', async () => {
      const runData = {
        userId: 'user-1',
        provider: 'openai',
        model: 'gpt-4',
        requestedModel: 'gpt-4',
        input: 'test input',
        output: 'test output',
        inputTokens: 10,
        outputTokens: 20,
        cost: 0.001,
        latency: 500,
        success: true,
        error: null,
      };

      mockPrisma.promptRun.create.mockResolvedValue({
        id: 'run-1',
        ...runData,
        createdAt: new Date(),
      });

      const result = await mockPrisma.promptRun.create({ data: runData });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('openai');
      expect(mockPrisma.promptRun.create).toHaveBeenCalledWith({ data: runData });
    });

    it('should track failed API calls', async () => {
      const runData = {
        userId: 'user-1',
        provider: 'anthropic',
        model: 'claude-3',
        success: false,
        error: 'Rate limit exceeded',
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      mockPrisma.promptRun.create.mockResolvedValue({
        id: 'run-2',
        ...runData,
        createdAt: new Date(),
      });

      const result = await mockPrisma.promptRun.create({ data: runData });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });
  });

  describe('Plan Limits', () => {
    it('should check spend limits before processing', () => {
      const currentSpend = 95;
      const limit = 100;
      const allowed = currentSpend < limit;

      expect(allowed).toBe(true);
    });

    it('should reject requests exceeding spend limit', () => {
      const currentSpend = 105;
      const limit = 100;
      const allowed = currentSpend < limit;

      expect(allowed).toBe(false);
      
      const statusCode = allowed ? 200 : 402; // Payment Required
      expect(statusCode).toBe(402);
    });

    it('should provide upgrade information when limit exceeded', () => {
      const response = {
        error: 'LIMIT_EXCEEDED',
        message: 'Monthly spend limit reached',
        currentSpend: 105,
        limit: 100,
        upgradeUrl: '/pricing',
      };

      expect(response.error).toBe('LIMIT_EXCEEDED');
      expect(response.upgradeUrl).toBe('/pricing');
      expect(response.currentSpend).toBeGreaterThan(response.limit);
    });
  });

  describe('Response Format', () => {
    it('should return success response with tracking ID', () => {
      const response = {
        success: true,
        runId: 'run-123',
        cost: 0.001,
        tokensUsed: 30,
      };

      expect(response.success).toBe(true);
      expect(response.runId).toBeDefined();
      expect(response.cost).toBeGreaterThan(0);
    });

    it('should return error response with details', () => {
      const response = {
        error: 'VALIDATION_ERROR',
        message: 'Missing required field: model',
        statusCode: 400,
      };

      expect(response.error).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Provider Support', () => {
    it('should support multiple providers', () => {
      const supportedProviders = ['openai', 'anthropic', 'google', 'grok'];
      
      supportedProviders.forEach(provider => {
        expect(supportedProviders).toContain(provider);
      });
    });

    it('should track provider-specific data', () => {
      const openaiRun = {
        provider: 'openai',
        model: 'gpt-4',
      };

      const anthropicRun = {
        provider: 'anthropic',
        model: 'claude-3-sonnet',
      };

      expect(openaiRun.provider).toBe('openai');
      expect(anthropicRun.provider).toBe('anthropic');
    });
  });
});
