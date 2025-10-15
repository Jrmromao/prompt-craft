import { CostCalculator, MODEL_PRICING } from '@/lib/services/costCalculator';

describe('CostCalculator', () => {
  describe('calculateCost', () => {
    it('should calculate GPT-4 cost correctly', () => {
      const cost = CostCalculator.calculateCost('gpt-4', 1000, 1000);
      const expected = (1000 / 1000) * 0.03 + (1000 / 1000) * 0.06;
      expect(cost).toBe(expected);
      expect(cost).toBe(0.09);
    });

    it('should calculate GPT-3.5 cost correctly', () => {
      const cost = CostCalculator.calculateCost('gpt-3.5-turbo', 1000, 1000);
      const expected = (1000 / 1000) * 0.0005 + (1000 / 1000) * 0.0015;
      expect(cost).toBe(expected);
      expect(cost).toBe(0.002);
    });

    it('should calculate Claude Opus cost correctly', () => {
      const cost = CostCalculator.calculateCost('claude-3-opus', 1000, 1000);
      const expected = (1000 / 1000) * 0.015 + (1000 / 1000) * 0.075;
      expect(cost).toBe(expected);
      expect(cost).toBe(0.09);
    });

    it('should handle unknown models with default pricing', () => {
      const cost = CostCalculator.calculateCost('unknown-model', 1000, 1000);
      const defaultCost = CostCalculator.calculateCost('gpt-3.5-turbo', 1000, 1000);
      expect(cost).toBe(defaultCost);
    });

    it('should handle zero tokens', () => {
      const cost = CostCalculator.calculateCost('gpt-4', 0, 0);
      expect(cost).toBe(0);
    });

    it('should handle large token counts', () => {
      const cost = CostCalculator.calculateCost('gpt-4', 100000, 100000);
      const expected = (100000 / 1000) * 0.03 + (100000 / 1000) * 0.06;
      expect(cost).toBe(expected);
      expect(cost).toBe(9);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost based on prompt length', () => {
      const promptLength = 400; // ~100 tokens
      const cost = CostCalculator.estimateCost('gpt-4', promptLength, 500);
      expect(cost).toBeGreaterThan(0);
    });

    it('should use default maxTokens of 500', () => {
      const cost1 = CostCalculator.estimateCost('gpt-4', 400);
      const cost2 = CostCalculator.estimateCost('gpt-4', 400, 500);
      expect(cost1).toBe(cost2);
    });

    it('should estimate higher cost for longer prompts', () => {
      const shortCost = CostCalculator.estimateCost('gpt-4', 100);
      const longCost = CostCalculator.estimateCost('gpt-4', 1000);
      expect(longCost).toBeGreaterThan(shortCost);
    });
  });

  describe('compareModels', () => {
    it('should return models sorted by cost', () => {
      const comparison = CostCalculator.compareModels(1000, 1000);
      
      expect(comparison.length).toBeGreaterThan(0);
      expect(comparison[0].cost).toBeLessThanOrEqual(comparison[1].cost);
    });

    it('should include all model details', () => {
      const comparison = CostCalculator.compareModels(1000, 1000);
      const first = comparison[0];
      
      expect(first).toHaveProperty('model');
      expect(first).toHaveProperty('cost');
      expect(first).toHaveProperty('inputCost');
      expect(first).toHaveProperty('outputCost');
    });

    it('should show DeepSeek as cheapest', () => {
      const comparison = CostCalculator.compareModels(1000, 1000);
      expect(comparison[0].model).toBe('deepseek-chat');
    });

    it('should calculate input and output costs separately', () => {
      const comparison = CostCalculator.compareModels(1000, 1000);
      const gpt4 = comparison.find(m => m.model === 'gpt-4');
      
      expect(gpt4?.inputCost).toBe(0.03);
      expect(gpt4?.outputCost).toBe(0.06);
      expect(gpt4?.cost).toBe(0.09);
    });
  });

  describe('calculateSavings', () => {
    it('should calculate monthly savings when switching models', () => {
      const savings = CostCalculator.calculateSavings(
        'gpt-4',
        'gpt-3.5-turbo',
        100, // monthly runs
        1000, // avg input tokens
        1000  // avg output tokens
      );
      
      const gpt4Cost = 0.09;
      const gpt35Cost = 0.002;
      const expected = (gpt4Cost - gpt35Cost) * 100;
      
      expect(savings).toBeCloseTo(expected, 2);
      expect(savings).toBeCloseTo(8.8, 1);
    });

    it('should return negative savings if alternative is more expensive', () => {
      const savings = CostCalculator.calculateSavings(
        'gpt-3.5-turbo',
        'gpt-4',
        100,
        1000,
        1000
      );
      
      expect(savings).toBeLessThan(0);
    });

    it('should scale with number of runs', () => {
      const savings100 = CostCalculator.calculateSavings(
        'gpt-4',
        'gpt-3.5-turbo',
        100,
        1000,
        1000
      );
      
      const savings200 = CostCalculator.calculateSavings(
        'gpt-4',
        'gpt-3.5-turbo',
        200,
        1000,
        1000
      );
      
      expect(savings200).toBe(savings100 * 2);
    });

    it('should handle zero runs', () => {
      const savings = CostCalculator.calculateSavings(
        'gpt-4',
        'gpt-3.5-turbo',
        0,
        1000,
        1000
      );
      
      expect(savings).toBe(0);
    });
  });

  describe('MODEL_PRICING', () => {
    it.skip('should have pricing for all major models', () => {
      expect(MODEL_PRICING).toHaveProperty('gpt-4');
      expect(MODEL_PRICING).toHaveProperty('gpt-3.5-turbo');
      expect(MODEL_PRICING).toHaveProperty('claude-3-opus');
      expect(MODEL_PRICING).toHaveProperty('deepseek-chat');
    });

    it('should have input and output pricing for each model', () => {
      Object.values(MODEL_PRICING).forEach(pricing => {
        expect(pricing).toHaveProperty('input');
        expect(pricing).toHaveProperty('output');
        expect(pricing.input).toBeGreaterThan(0);
        expect(pricing.output).toBeGreaterThan(0);
      });
    });

    it('should have output cost >= input cost for all models', () => {
      Object.values(MODEL_PRICING).forEach(pricing => {
        expect(pricing.output).toBeGreaterThanOrEqual(pricing.input);
      });
    });
  });
});
