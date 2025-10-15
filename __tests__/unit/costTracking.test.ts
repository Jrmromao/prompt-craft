import { 
  calculateApiCost, 
  costToCredits, 
  creditsToUSD,
  canAccessModel,
  estimateCost,
  getModelTier,
  getCheapestModel,
  estimateTokens,
  getAvailableModels,
  getModelCostSummary,
  COST_LIMITS,
  MODEL_COSTS
} from '@/app/constants/modelCosts';

describe.skip('Model Cost Calculations', () => {
  describe('calculateApiCost', () => {
    it('should calculate DeepSeek cost correctly', () => {
      const cost = calculateApiCost('deepseek-chat', 1_000_000, 1_000_000);
      expect(cost).toBe(0.42); // 0.14 + 0.28
    });

    it('should calculate GPT-4 cost correctly', () => {
      const cost = calculateApiCost('gpt-4-turbo', 1_000_000, 1_000_000);
      expect(cost).toBe(40.00); // 10 + 30
    });

    it('should handle small token counts', () => {
      const cost = calculateApiCost('deepseek-chat', 1000, 1000);
      expect(cost).toBeCloseTo(0.00042, 5);
    });

    it('should fallback to deepseek for unknown models', () => {
      const cost = calculateApiCost('unknown-model', 1_000_000, 1_000_000);
      expect(cost).toBe(0.42);
    });

    it('should handle zero tokens', () => {
      const cost = calculateApiCost('deepseek-chat', 0, 0);
      expect(cost).toBe(0);
    });
  });

  describe('Credit Conversion', () => {
    it('should convert cost to credits (1 credit = $0.01)', () => {
      expect(costToCredits(0.01)).toBe(1);
      expect(costToCredits(1.00)).toBe(100);
      expect(costToCredits(0.005)).toBe(1); // Rounds up
    });

    it('should convert credits to USD', () => {
      expect(creditsToUSD(1)).toBe(0.01);
      expect(creditsToUSD(100)).toBe(1.00);
    });

    it('should be reversible', () => {
      const original = 5.50;
      const credits = costToCredits(original);
      const back = creditsToUSD(credits);
      expect(back).toBeCloseTo(original, 2);
    });
  });

  describe('Model Access Control', () => {
    it('should allow FREE users only free tier models', () => {
      expect(canAccessModel('deepseek-chat', 'FREE')).toBe(true);
      expect(canAccessModel('gpt-4-turbo', 'FREE')).toBe(false);
      expect(canAccessModel('claude-3.5-sonnet', 'FREE')).toBe(false);
    });

    it('should allow PRO users standard and premium models', () => {
      expect(canAccessModel('deepseek-chat', 'PRO')).toBe(true);
      expect(canAccessModel('gpt-4-turbo', 'PRO')).toBe(true);
      expect(canAccessModel('gpt-4', 'PRO')).toBe(false); // Enterprise only
    });

    it('should allow ENTERPRISE users all models', () => {
      expect(canAccessModel('deepseek-chat', 'ENTERPRISE')).toBe(true);
      expect(canAccessModel('gpt-4', 'ENTERPRISE')).toBe(true);
      expect(canAccessModel('claude-3-opus', 'ENTERPRISE')).toBe(true);
    });
  });

  describe('Cost Estimation', () => {
    it('should estimate tokens from text', () => {
      const text = 'Hello world'; // 11 chars
      const tokens = estimateTokens(text);
      expect(tokens).toBe(3); // 11/4 = 2.75, rounded up
    });

    it('should estimate cost for a prompt', () => {
      const prompt = 'Write a story about AI';
      const estimate = estimateCost('deepseek-chat', prompt, 500);
      
      expect(estimate.tokens.input).toBeGreaterThan(0);
      expect(estimate.tokens.output).toBe(500);
      expect(estimate.costUSD).toBeGreaterThan(0);
      expect(estimate.credits).toBeGreaterThan(0);
    });

    it('should estimate higher cost for expensive models', () => {
      const prompt = 'Test prompt';
      const cheapEstimate = estimateCost('deepseek-chat', prompt, 500);
      const expensiveEstimate = estimateCost('gpt-4-turbo', prompt, 500);
      
      expect(expensiveEstimate.costUSD).toBeGreaterThan(cheapEstimate.costUSD);
      expect(expensiveEstimate.credits).toBeGreaterThan(cheapEstimate.credits);
    });
  });

  describe('Model Utilities', () => {
    it('should return cheapest model', () => {
      const cheapest = getCheapestModel();
      expect(cheapest).toBe('deepseek-coder-6.7b');
    });

    it('should get correct model tier', () => {
      expect(getModelTier('deepseek-chat')).toBe('free');
      expect(getModelTier('gpt-4-turbo')).toBe('premium');
      expect(getModelTier('gpt-4')).toBe('enterprise');
    });

    it('should get available models for plan', () => {
      const freeModels = getAvailableModels('FREE');
      const proModels = getAvailableModels('PRO');
      
      expect(freeModels.length).toBeLessThan(proModels.length);
      expect(freeModels).toContain('deepseek-chat');
      expect(proModels).toContain('gpt-4-turbo');
    });

    it('should provide cost summary', () => {
      expect(getModelCostSummary('deepseek-chat')).toContain('cheap');
      expect(getModelCostSummary('gpt-4')).toContain('Expensive');
    });
  });

  describe('Cost Limits', () => {
    it('should have defined limits for all plans', () => {
      expect(COST_LIMITS.FREE).toBe(0.50);
      expect(COST_LIMITS.PRO).toBe(5.00);
      expect(COST_LIMITS.ENTERPRISE).toBe(50.00);
    });

    it('should have limits in ascending order', () => {
      expect(COST_LIMITS.FREE).toBeLessThan(COST_LIMITS.PRO);
      expect(COST_LIMITS.PRO).toBeLessThan(COST_LIMITS.ENTERPRISE);
    });
  });

  describe('Model Cost Data Integrity', () => {
    it('should have costs for all models', () => {
      const models = Object.keys(MODEL_COSTS);
      expect(models.length).toBeGreaterThan(0);
      
      models.forEach(model => {
        expect(MODEL_COSTS[model].input).toBeGreaterThan(0);
        expect(MODEL_COSTS[model].output).toBeGreaterThan(0);
        expect(MODEL_COSTS[model].provider).toBeTruthy();
        expect(MODEL_COSTS[model].tier).toBeTruthy();
      });
    });

    it('should have output cost >= input cost', () => {
      Object.values(MODEL_COSTS).forEach(cost => {
        expect(cost.output).toBeGreaterThanOrEqual(cost.input);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large token counts', () => {
      const cost = calculateApiCost('deepseek-chat', 100_000_000, 100_000_000);
      expect(cost).toBeGreaterThan(0);
      expect(isFinite(cost)).toBe(true);
    });

    it('should handle empty text estimation', () => {
      const tokens = estimateTokens('');
      expect(tokens).toBe(0);
    });

    it('should handle negative values gracefully', () => {
      const cost = calculateApiCost('deepseek-chat', -1000, -1000);
      expect(cost).toBeLessThanOrEqual(0);
    });
  });
});
