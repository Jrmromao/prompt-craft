describe('SDK Error Handling Integration', () => {
  describe('Invalid API Key Handling', () => {
    it('should not throw when API key is invalid', () => {
      const PromptCraft = require('@/sdk/src/index').PromptCraft;
      
      expect(() => {
        new PromptCraft({ apiKey: 'invalid_key' });
      }).not.toThrow();
    });

    it('should warn about invalid API key', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const PromptCraft = require('@/sdk/src/index').PromptCraft;
      
      new PromptCraft({ apiKey: '' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No API key provided')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Tracking Failures', () => {
    it('should not break app when tracking fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const PromptCraft = require('@/sdk/src/index').PromptCraft;
      const pc = new PromptCraft({ apiKey: 'test_key' });
      
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
      
      const PromptCraft = require('@/sdk/src/index').PromptCraft;
      const pc = new PromptCraft({ apiKey: 'invalid', autoOptimize: true });
      
      const result = await pc['optimizePromptContent']('test prompt');
      
      // Should return original prompt
      expect(result).toBe('test prompt');
    });

    it('should continue working when routing check fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Timeout'));
      
      const PromptCraft = require('@/sdk/src/index').PromptCraft;
      const pc = new PromptCraft({ apiKey: 'test', smartRouting: true });
      
      const result = await pc['checkRoutingEnabled']();
      
      // Should default to enabled
      expect(result).toBe(true);
    });
  });
});
