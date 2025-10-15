import { AICostOptimizer } from '@/lib/services/aiCostOptimizer';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'Write a professional email about the quarterly report with key points.',
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe('AICostOptimizer', () => {
  describe('optimizePrompt', () => {
    it('should optimize a verbose prompt', async () => {
      const original =
        'You are a helpful assistant. Please write a professional email about the quarterly report. Make sure it is polite and includes all the key points.';

      const result = await AICostOptimizer.optimizePrompt(original, 'gpt-3.5-turbo');

      expect(result.original).toBe(original);
      expect(result.optimized).toBeTruthy();
      expect(result.optimized.length).toBeLessThan(original.length);
      expect(result.tokenReduction).toBeGreaterThan(0);
      expect(result.estimatedSavings).toBeGreaterThan(0);
      expect(result.quality).toBeGreaterThan(0);
    });

    it('should calculate token reduction correctly', async () => {
      const original = 'This is a test prompt that is quite long and verbose';
      const result = await AICostOptimizer.optimizePrompt(original);

      expect(result.originalTokens).toBeGreaterThan(0);
      expect(result.optimizedTokens).toBeGreaterThan(0);
      expect(result.tokenReduction).toBe(
        Math.round(((result.originalTokens - result.optimizedTokens) / result.originalTokens) * 100)
      );
    });

    it('should calculate cost savings for different models', async () => {
      const original = 'Test prompt';

      const gpt4Result = await AICostOptimizer.optimizePrompt(original, 'gpt-4');
      const gpt35Result = await AICostOptimizer.optimizePrompt(original, 'gpt-3.5-turbo');

      // GPT-4 is more expensive, so savings should be higher
      expect(gpt4Result.estimatedSavings).toBeGreaterThan(gpt35Result.estimatedSavings);
    });
  });

  describe('analyzePrompt', () => {
    it('should detect generic system prompts', async () => {
      const prompt = 'You are a helpful assistant. Write an email.';
      const analysis = await AICostOptimizer.analyzePrompt(prompt);

      expect(analysis.issues).toContain('Contains generic system prompt');
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('should detect politeness words', async () => {
      const prompt = 'Please write an email about the report.';
      const analysis = await AICostOptimizer.analyzePrompt(prompt);

      expect(analysis.issues).toContain('Contains politeness words');
    });

    it('should detect redundant instructions', async () => {
      const prompt = 'Make sure to write a detailed report.';
      const analysis = await AICostOptimizer.analyzePrompt(prompt);

      expect(analysis.issues).toContain('Contains redundant instructions');
    });

    it('should detect long prompts', async () => {
      const prompt = 'word '.repeat(101); // 101 words
      const analysis = await AICostOptimizer.analyzePrompt(prompt);

      expect(analysis.issues).toContain('Prompt is too long');
    });

    it('should calculate potential savings', async () => {
      const prompt = 'Test prompt';
      const analysis = await AICostOptimizer.analyzePrompt(prompt);

      expect(analysis.potentialSavings).toBeGreaterThanOrEqual(0);
    });
  });

  describe('batchOptimize', () => {
    it('should optimize multiple prompts', async () => {
      const prompts = [
        'You are a helpful assistant. Write an email.',
        'Please write a report about sales.',
        'Make sure to include all details.',
      ];

      const results = await AICostOptimizer.batchOptimize(prompts);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.optimized).toBeTruthy();
        expect(result.tokenReduction).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('quality scoring', () => {
    it('should give high scores to good optimizations', () => {
      const original = 'You are a helpful assistant. Please write a professional email.';
      const optimized = 'Write a professional email.';

      // Access private method via any
      const score = (AICostOptimizer as any).calculateQualityScore(original, optimized);

      expect(score).toBeGreaterThan(70);
    });

    it('should give low scores to poor optimizations', () => {
      const original = 'Write a detailed report about quarterly sales.';
      const optimized = 'Write.';

      const score = (AICostOptimizer as any).calculateQualityScore(original, optimized);

      expect(score).toBeLessThan(70);
    });

    it('should penalize empty optimizations', () => {
      const original = 'Write an email.';
      const optimized = '';

      const score = (AICostOptimizer as any).calculateQualityScore(original, optimized);

      expect(score).toBeLessThan(60);
    });
  });
});
