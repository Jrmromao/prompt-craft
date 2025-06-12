import { AIService } from '@/lib/services/aiService';

jest.mock('@/lib/services/aiService', () => ({
  AIService: {
    getInstance: jest.fn(() => ({
      generateText: jest.fn(),
    })),
  },
}));

describe('AI Service', () => {
  const service = AIService.getInstance();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockGenerateText = service.generateText as jest.Mock;
      mockGenerateText.mockResolvedValue({
        text: 'Test completion',
        tokenCount: 10,
        model: 'deepseek',
      });

      const result = await service.generateText('Test prompt', {
        model: 'deepseek',
        temperature: 0.7,
      });

      expect(result).toEqual({
        text: 'Test completion',
        tokenCount: 10,
        model: 'deepseek',
      });
    });
  });
});
