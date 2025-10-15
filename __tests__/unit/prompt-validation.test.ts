describe('Prompt Validation', () => {
  it('should validate prompt name', () => {
    const validatePromptName = (name: string) => {
      if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
      }
      if (name.length > 100) {
        return { valid: false, error: 'Name too long' };
      }
      return { valid: true };
    };

    expect(validatePromptName('')).toEqual({ valid: false, error: 'Name is required' });
    expect(validatePromptName('   ')).toEqual({ valid: false, error: 'Name is required' });
    expect(validatePromptName('Valid Name')).toEqual({ valid: true });
    expect(validatePromptName('a'.repeat(101))).toEqual({ valid: false, error: 'Name too long' });
  });

  it('should validate prompt content', () => {
    const validatePromptContent = (content: string) => {
      if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Content is required' };
      }
      if (content.length > 10000) {
        return { valid: false, error: 'Content too long' };
      }
      return { valid: true };
    };

    expect(validatePromptContent('')).toEqual({ valid: false, error: 'Content is required' });
    expect(validatePromptContent('Valid content')).toEqual({ valid: true });
    expect(validatePromptContent('a'.repeat(10001))).toEqual({ valid: false, error: 'Content too long' });
  });

  it('should generate slug from name', () => {
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    expect(generateSlug('Test Prompt')).toBe('test-prompt');
    expect(generateSlug('Test & Special Characters!')).toBe('test-special-characters');
    expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('should validate user plan limits', () => {
    const checkPromptLimit = (userPlan: string, currentPrompts: number) => {
      const limits = {
        FREE: 10,
        PRO: Infinity,
      };
      
      const limit = limits[userPlan as keyof typeof limits] || 0;
      return {
        canCreate: currentPrompts < limit,
        limit,
        remaining: Math.max(0, limit - currentPrompts),
      };
    };

    expect(checkPromptLimit('FREE', 5)).toEqual({
      canCreate: true,
      limit: 10,
      remaining: 5,
    });

    expect(checkPromptLimit('FREE', 10)).toEqual({
      canCreate: false,
      limit: 10,
      remaining: 0,
    });

    expect(checkPromptLimit('PRO', 100)).toEqual({
      canCreate: true,
      limit: Infinity,
      remaining: Infinity,
    });
  });
});
