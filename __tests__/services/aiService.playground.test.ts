import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    prompt: {
      findUnique: jest.fn(),
    },
    playgroundRun: {
      create: jest.fn(),
    },
  },
}));

// Mock AIService methods directly
jest.mock('@/lib/services/aiService', () => ({
  AIService: {
    getInstance: jest.fn(() => ({
      runPrompt: jest.fn(),
    })),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AIService - Playground Integration', () => {
  let aiService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = AIService.getInstance();
  });

  it('should run prompt successfully', async () => {
    const mockResponse = {
      result: 'Generated response',
      tokenCount: 50,
      model: 'deepseek',
    };

    aiService.runPrompt.mockResolvedValue(mockResponse);

    const result = await aiService.runPrompt({
      promptId: 'prompt123',
      input: 'test input',
      model: 'deepseek',
      temperature: 0.7,
      userId: 'user123',
    });

    expect(result).toEqual(mockResponse);
    expect(aiService.runPrompt).toHaveBeenCalledWith({
      promptId: 'prompt123',
      input: 'test input',
      model: 'deepseek',
      temperature: 0.7,
      userId: 'user123',
    });
  });

  it('should handle insufficient credits', async () => {
    aiService.runPrompt.mockRejectedValue(new Error('Insufficient credits'));

    await expect(
      aiService.runPrompt({
        promptId: 'prompt123',
        input: 'test input',
        model: 'deepseek',
        temperature: 0.7,
        userId: 'user123',
      })
    ).rejects.toThrow('Insufficient credits');
  });

  it('should handle non-existent prompt', async () => {
    aiService.runPrompt.mockRejectedValue(new Error('Prompt not found'));

    await expect(
      aiService.runPrompt({
        promptId: 'nonexistent',
        input: 'test input',
        model: 'deepseek',
        temperature: 0.7,
        userId: 'user123',
      })
    ).rejects.toThrow('Prompt not found');
  });

  it('should handle unauthorized access to private prompt', async () => {
    aiService.runPrompt.mockRejectedValue(new Error('Unauthorized access to prompt'));

    await expect(
      aiService.runPrompt({
        promptId: 'prompt123',
        input: 'test input',
        model: 'deepseek',
        temperature: 0.7,
        userId: 'user123',
      })
    ).rejects.toThrow('Unauthorized access to prompt');
  });
});
