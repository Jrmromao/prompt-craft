import { PromptCraft } from '../src/index';

describe('SDK v2.0 Killer Features', () => {
  let promptcraft: PromptCraft;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    promptcraft = new PromptCraft({
      apiKey: 'test-key',
      baseUrl: 'http://localhost:3000',
    });
  });

  describe('Smart Routing', () => {
    it('should route simple queries to cheaper models', () => {
      const promptcraft = new PromptCraft({
        apiKey: 'test-key',
        smartRouting: true,
      });

      const messages = [{ role: 'user', content: 'Hi' }];
      const result = (promptcraft as any).selectOptimalModel('gpt-4', messages);
      
      expect(result).toBe('gpt-3.5-turbo');
    });

    it('should keep complex queries on expensive models', () => {
      const promptcraft = new PromptCraft({
        apiKey: 'test-key',
        smartRouting: true,
      });

      const messages = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Write a detailed analysis of quantum computing with at least 500 words covering the following topics...' }
      ];
      const result = (promptcraft as any).selectOptimalModel('gpt-4', messages);
      
      expect(result).toBe('gpt-4');
    });

    it('should route Claude Opus simple queries to Haiku', () => {
      const promptcraft = new PromptCraft({
        apiKey: 'test-key',
        smartRouting: true,
      });

      const messages = [{ role: 'user', content: 'Hello' }];
      const result = (promptcraft as any).selectOptimalModel('claude-3-opus', messages);
      
      expect(result).toBe('claude-3-haiku');
    });

    it('should route Claude Opus medium queries to Sonnet', () => {
      const promptcraft = new PromptCraft({
        apiKey: 'test-key',
        smartRouting: true,
      });

      const messages = [
        { role: 'user', content: 'Explain the concept of machine learning in detail. ' + 'x'.repeat(400) }
      ];
      const result = (promptcraft as any).selectOptimalModel('claude-3-opus', messages);
      
      expect(result).toBe('claude-3-sonnet');
    });
  });

  describe('Auto-Fallback', () => {
    it('should return correct fallback chain for GPT-4', () => {
      const fallbacks = (promptcraft as any).getDefaultFallbacks('gpt-4');
      expect(fallbacks).toEqual(['gpt-4-turbo', 'gpt-3.5-turbo']);
    });

    it('should return correct fallback chain for Claude Opus', () => {
      const fallbacks = (promptcraft as any).getDefaultFallbacks('claude-3-opus');
      expect(fallbacks).toEqual(['claude-3-sonnet', 'claude-3-haiku']);
    });

    it('should return correct fallback chain for Gemini Pro', () => {
      const fallbacks = (promptcraft as any).getDefaultFallbacks('gemini-1.5-pro');
      expect(fallbacks).toEqual(['gemini-1.5-flash']);
    });

    it('should return empty array for unknown models', () => {
      const fallbacks = (promptcraft as any).getDefaultFallbacks('unknown-model');
      expect(fallbacks).toEqual([]);
    });
  });

  describe('Cost Estimation', () => {
    it('should estimate GPT-4 cost correctly', () => {
      const messages = [{ role: 'user', content: 'Hello world' }];
      const cost = (promptcraft as any).estimateCost('gpt-4', messages);
      
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.01); // Small message should be cheap
    });

    it('should estimate GPT-3.5 as cheaper than GPT-4', () => {
      const messages = [{ role: 'user', content: 'Hello world' }];
      const gpt4Cost = (promptcraft as any).estimateCost('gpt-4', messages);
      const gpt35Cost = (promptcraft as any).estimateCost('gpt-3.5-turbo', messages);
      
      expect(gpt35Cost).toBeLessThan(gpt4Cost);
    });

    it('should estimate Claude Haiku as cheaper than Opus', () => {
      const messages = [{ role: 'user', content: 'Hello world' }];
      const opusCost = (promptcraft as any).estimateCost('claude-3-opus', messages);
      const haikuCost = (promptcraft as any).estimateCost('claude-3-haiku', messages);
      
      expect(haikuCost).toBeLessThan(opusCost);
    });
  });

  describe('Complexity Detection', () => {
    it('should detect simple queries', () => {
      const messages = [{ role: 'user', content: 'Hi' }];
      const complexity = (promptcraft as any).estimateComplexity(messages);
      
      expect(complexity).toBe('simple');
    });

    it('should detect medium queries', () => {
      const messages = [
        { role: 'user', content: 'Explain machine learning. ' + 'x'.repeat(200) }
      ];
      const complexity = (promptcraft as any).estimateComplexity(messages);
      
      expect(complexity).toBe('medium');
    });

    it('should detect complex queries', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Write a detailed analysis. ' + 'x'.repeat(600) }
      ];
      const complexity = (promptcraft as any).estimateComplexity(messages);
      
      expect(complexity).toBe('complex');
    });
  });

  describe('Integration', () => {
    it('should enable all killer features together', () => {
      const promptcraft = new PromptCraft({
        apiKey: 'test-key',
        enableCache: true,
        autoFallback: true,
        smartRouting: true,
        costLimit: 0.10,
        maxRetries: 3,
      });

      expect((promptcraft as any).config.enableCache).toBe(true);
      expect((promptcraft as any).config.autoFallback).toBe(true);
      expect((promptcraft as any).config.smartRouting).toBe(true);
      expect((promptcraft as any).config.costLimit).toBe(0.10);
      expect((promptcraft as any).config.maxRetries).toBe(3);
    });
  });
});
