import { PromptCraft } from '@/lib/sdk';

describe('PromptCraft SDK', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('trackRun', () => {
    it('should track successful run', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const sdk = new PromptCraft({ apiKey: 'test-key' });
      
      await sdk.trackRun({
        promptId: 'test-prompt',
        model: 'gpt-4',
        input: 'Hello',
        output: 'Hi there',
        tokensUsed: 10,
        latency: 500,
        success: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/integrations/run',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
          },
        })
      );
    });

    it('should track failed run with error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const sdk = new PromptCraft({ apiKey: 'test-key' });
      
      await sdk.trackRun({
        promptId: 'test-prompt',
        model: 'gpt-4',
        input: 'Hello',
        output: '',
        tokensUsed: 0,
        latency: 100,
        success: false,
        error: 'Rate limit exceeded',
      });

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      
      expect(body.success).toBe(false);
      expect(body.error).toBe('Rate limit exceeded');
    });

    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const sdk = new PromptCraft({ apiKey: 'invalid-key' });
      
      await expect(sdk.trackRun({
        promptId: 'test',
        model: 'gpt-4',
        input: 'test',
        output: 'test',
        tokensUsed: 10,
        latency: 100,
        success: true,
      })).rejects.toThrow('Failed to track run: Unauthorized');
    });
  });

  describe('wrapOpenAI', () => {
    it('should track successful OpenAI call', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 },
      });

      const mockClient = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const sdk = new PromptCraft({ apiKey: 'test-key' });
      const wrapped = sdk.wrapOpenAI(mockClient as any);

      await wrapped.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        promptId: 'test-prompt',
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      
      const trackCall = mockFetch.mock.calls[0];
      const body = JSON.parse(trackCall[1].body);
      
      expect(body.success).toBe(true);
      expect(body.tokensUsed).toBe(50);
    });

    it('should track failed OpenAI call', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Rate limit'));

      const mockClient = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const sdk = new PromptCraft({ apiKey: 'test-key' });
      const wrapped = sdk.wrapOpenAI(mockClient as any);

      await expect(wrapped.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        promptId: 'test-prompt',
      })).rejects.toThrow('Rate limit');

      const trackCall = mockFetch.mock.calls[0];
      const body = JSON.parse(trackCall[1].body);
      
      expect(body.success).toBe(false);
      expect(body.error).toBe('Rate limit');
    });
  });
});
