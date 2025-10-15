/**
 * Integration test for Prompt Optimization API
 */

describe('Prompt Optimization API', () => {
  const mockUserId = 'test-user-123';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    // Mock auth
    jest.mock('@clerk/nextjs/server', () => ({
      auth: jest.fn().mockResolvedValue({ userId: mockUserId }),
    }));
  });

  describe('POST /api/prompts/optimize', () => {
    it('should optimize a prompt successfully', async () => {
      const prompt =
        'You are a helpful assistant. Please write a professional email about the quarterly report.';

      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({ prompt, targetModel: 'gpt-3.5-turbo' }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.original).toBe(prompt);
      expect(data.optimized).toBeTruthy();
      expect(data.optimized.length).toBeLessThan(prompt.length);
      expect(data.tokenReduction).toBeGreaterThan(0);
      expect(data.estimatedSavings).toBeGreaterThan(0);
      expect(data.qualityScore).toBeGreaterThan(0);
    });

    it('should enforce free tier limits', async () => {
      // Mock user with FREE plan and 3 optimizations already used
      const prompt = 'Test prompt';

      // First 3 should succeed
      for (let i = 0; i < 3; i++) {
        const response = await fetch('/api/prompts/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockApiKey}`,
          },
          body: JSON.stringify({ prompt }),
        });
        expect(response.status).toBe(200);
      }

      // 4th should fail
      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({ prompt }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Free plan limited to 3 optimizations');
    });

    it('should save optimization to database', async () => {
      const prompt = 'Test prompt for database';

      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({ prompt }),
      });

      expect(response.status).toBe(200);

      // Check database
      const optimization = await prisma.promptOptimization.findFirst({
        where: { userId: mockUserId, originalPrompt: prompt },
      });

      expect(optimization).toBeTruthy();
      expect(optimization?.optimizedPrompt).toBeTruthy();
      expect(optimization?.tokenReduction).toBeGreaterThan(0);
    });

    it('should return 401 for unauthorized requests', async () => {
      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing prompt', async () => {
      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Prompt is required');
    });
  });

  describe('Optimization Quality', () => {
    it('should maintain prompt intent', async () => {
      const prompt = 'Write a professional email about quarterly sales results';

      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      // Check that key words are preserved
      expect(data.optimized.toLowerCase()).toContain('email');
      expect(data.optimized.toLowerCase()).toContain('sales');
    });

    it('should achieve significant token reduction', async () => {
      const verbosePrompt =
        'You are a helpful assistant. Please write a very professional and polite email about the quarterly sales report. Make sure to include all the important details and key points from the meeting.';

      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({ prompt: verbosePrompt }),
      });

      const data = await response.json();

      // Should reduce by at least 30%
      expect(data.tokenReduction).toBeGreaterThanOrEqual(30);
    });
  });
});
