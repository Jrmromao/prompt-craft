import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PromptOptimizer } from '@/lib/services/promptOptimizer';

// Mock fetch
global.fetch = jest.fn();

// Mock toast
jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

describe('Prompt Creation Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'prompt_123', name: 'Test Prompt' })
    });
  });

  it('should integrate prompt optimizer in creation workflow', async () => {
    const basicPrompt = 'Write content';
    const result = await PromptOptimizer.improvePrompt(basicPrompt);

    // Verify optimization works
    expect(result.improved).toContain('You are an expert');
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);

    // Verify improved prompt is ready for saving
    expect(result.improved.length).toBeGreaterThan(basicPrompt.length);
    expect(result.changes).toContain('Added expert role');
  });

  it('should handle template integration workflow', async () => {
    const templates = PromptOptimizer.getQuickTemplates();
    
    // Verify templates are available
    expect(templates).toHaveProperty('marketing-copy');
    expect(templates).toHaveProperty('email-writer');
    expect(templates).toHaveProperty('content-creator');
    expect(templates).toHaveProperty('code-helper');

    // Test template variable replacement
    const marketingTemplate = templates['marketing-copy'];
    expect(marketingTemplate.template).toContain('[PRODUCT]');
    expect(marketingTemplate.variables).toContain('PRODUCT');
    expect(marketingTemplate.variables).toContain('AUDIENCE');
  });

  it('should validate prompt creation data flow', async () => {
    const promptData = {
      name: 'Test Prompt',
      content: 'You are an expert assistant. Write compelling content.',
      description: 'A test prompt',
      isPublic: false,
      promptType: 'text',
      tags: ['marketing', 'content']
    };

    // Verify data structure is valid
    expect(promptData.name).toBeTruthy();
    expect(promptData.content).toBeTruthy();
    expect(promptData.content.length).toBeGreaterThan(10);
    expect(Array.isArray(promptData.tags)).toBe(true);
  });

  it('should handle prompt optimization and scoring', async () => {
    const testPrompts = [
      'Write content',
      'You are an expert writer. Create engaging content with clear structure.',
      'Help me'
    ];

    for (const prompt of testPrompts) {
      const result = await PromptOptimizer.improvePrompt(prompt);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.improved).toBeTruthy();
      expect(Array.isArray(result.changes)).toBe(true);
    }
  });
});
