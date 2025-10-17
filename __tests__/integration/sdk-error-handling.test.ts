describe('SDK Error Handling Integration', () => {
  describe('Invalid API Key Handling', () => {
    it('should not throw when API key is invalid', () => {
      const CostLens = require('@/sdk/src/index').CostLens;
      
      expect(() => {
        new CostLens({ apiKey: 'invalid_key' });
      }).not.toThrow();
    });

    it('should warn about invalid API key', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const CostLens = require('@/sdk/src/index').CostLens;
      
      new CostLens({ apiKey: '' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No API key provided')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Tracking Failures', () => {
    it('should not break app when tracking fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const CostLens = require('@/sdk/src/index').CostLens;
      const pc = new CostLens({ apiKey: 'test_key' });
      
      // Should not throw
      await expect(
        pc.trackRun({
          provider: 'openai',
          model: 'gpt-4',
          input: 'test',
          output: 'test',
          tokensUsed: 100,
          latency: 500,
          success: true,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Feature Degradation', () => {
    it('should continue working when optimization fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      
      const CostLens = require('@/sdk/src/index').CostLens;
      const pc = new CostLens({ apiKey: 'invalid', autoOptimize: true });
      
      const result = await pc['optimizePromptContent']('test prompt');
      
      // Should return original prompt
      expect(result).toBe('test prompt');
    });

    it('should continue working when routing check fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Timeout'));
      
      const CostLens = require('@/sdk/src/index').CostLens;
      const pc = new CostLens({ apiKey: 'test', smartRouting: true });
      
      const result = await pc['checkRoutingEnabled']();
      
      // Should default to enabled
      expect(result).toBe(true);
    });
  });
});
