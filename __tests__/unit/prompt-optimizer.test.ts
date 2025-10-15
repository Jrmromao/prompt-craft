import { describe, it, expect } from '@jest/globals';
import { PromptOptimizer } from '@/lib/services/promptOptimizer';

describe('Prompt Optimizer Unit Tests', () => {
  it('should improve a basic prompt', async () => {
    const basicPrompt = 'Write content';
    const result = await PromptOptimizer.improvePrompt(basicPrompt);

    expect(result.improved).toContain('You are an expert');
    expect(result.improved).toContain('Write content');
    expect(result.changes).toContain('Added expert role');
    expect(result.score).toBeGreaterThan(0);
  });

  it('should add output format to prompts', async () => {
    const prompt = 'Explain quantum physics';
    const result = await PromptOptimizer.improvePrompt(prompt);

    expect(result.improved).toContain('structured response');
    expect(result.changes).toContain('Added output format');
  });

  it('should not modify already good prompts too much', async () => {
    const goodPrompt = 'You are an expert physicist. Explain quantum mechanics in a clear, structured format with examples.';
    const result = await PromptOptimizer.improvePrompt(goodPrompt);

    expect(result.changes.length).toBeLessThan(3);
    expect(result.score).toBeGreaterThan(50);
  });

  it('should return quick templates', () => {
    const templates = PromptOptimizer.getQuickTemplates();

    expect(templates).toHaveProperty('marketing-copy');
    expect(templates).toHaveProperty('email-writer');
    expect(templates).toHaveProperty('content-creator');
    expect(templates).toHaveProperty('code-helper');

    expect(templates['marketing-copy'].variables).toContain('PRODUCT');
    expect(templates['email-writer'].template).toContain('[TOPIC]');
  });

  it('should handle empty prompts gracefully', async () => {
    const emptyPrompt = '';
    const result = await PromptOptimizer.improvePrompt(emptyPrompt);

    expect(result.improved).toContain('You are an expert');
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it('should handle very short prompts', async () => {
    const shortPrompt = 'Help';
    const result = await PromptOptimizer.improvePrompt(shortPrompt);

    expect(result.improved).toContain('Help');
    expect(result.improved).toContain('specific and detailed');
    expect(result.changes).toContain('Added specificity instruction');
  });
});
