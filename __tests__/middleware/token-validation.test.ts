import { validateApiTokenEdge } from '../../lib/edge-token-validation';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Token Validation Edge Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject invalid token formats', async () => {
    const result = await validateApiTokenEdge('invalid-token');
    expect(result).toBe(false);
  });

  it('should reject short tokens', async () => {
    const result = await validateApiTokenEdge('short');
    expect(result).toBe(false);
  });

  it('should reject empty tokens', async () => {
    const result = await validateApiTokenEdge('');
    expect(result).toBe(false);
  });

  it('should validate token format correctly', async () => {
    const validFormatToken = 'a1b2c3d4e5f6789012345678901234567890abcd';
    
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true })
    });

    const result = await validateApiTokenEdge(validFormatToken);
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/validate-token'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: validFormatToken })
      })
    );
  });

  it('should handle API validation failure', async () => {
    const validFormatToken = 'a1b2c3d4e5f6789012345678901234567890abcd';
    
    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false })
    });

    const result = await validateApiTokenEdge(validFormatToken);
    expect(result).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    const validFormatToken = 'a1b2c3d4e5f6789012345678901234567890abcd';
    
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const result = await validateApiTokenEdge(validFormatToken);
    expect(result).toBe(false);
  });

  it('should use cache for repeated requests', async () => {
    const validFormatToken = 'a1b2c3d4e5f6789012345678901234567890abcd';
    
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true })
    });

    // First call
    const result1 = await validateApiTokenEdge(validFormatToken);
    expect(result1).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const result2 = await validateApiTokenEdge(validFormatToken);
    expect(result2).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Should not call API again
  });
});
