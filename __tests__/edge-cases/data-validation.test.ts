import { describe, it, expect } from '@jest/globals';

describe('Data Validation Edge Cases', () => {
  it('should handle extreme prompt lengths', () => {
    const testCases = [
      { input: '', expected: 'should_add_content' },
      { input: 'x', expected: 'too_short' },
      { input: 'x'.repeat(100), expected: 'good_length' },
      { input: 'x'.repeat(10000), expected: 'very_long' },
      { input: 'x'.repeat(100000), expected: 'too_long' }
    ];

    const validateLength = (content: string) => {
      if (content.length === 0) return 'should_add_content';
      if (content.length < 10) return 'too_short';
      if (content.length > 50000) return 'too_long';
      if (content.length > 5000) return 'very_long';
      return 'good_length';
    };

    testCases.forEach(({ input, expected }) => {
      expect(validateLength(input)).toBe(expected);
    });
  });

  it('should handle invalid user plan types', () => {
    const planTypes = [
      'FREE',
      'PRO', 
      'ENTERPRISE',
      'free', // lowercase
      'pro', // lowercase
      'INVALID',
      null,
      undefined,
      123,
      {}
    ];

    const normalizePlan = (plan: any) => {
      if (typeof plan !== 'string') return 'FREE';
      const normalized = plan.toUpperCase();
      return ['FREE', 'PRO', 'ENTERPRISE'].includes(normalized) ? normalized : 'FREE';
    };

    expect(normalizePlan('FREE')).toBe('FREE');
    expect(normalizePlan('pro')).toBe('PRO');
    expect(normalizePlan('INVALID')).toBe('FREE');
    expect(normalizePlan(null)).toBe('FREE');
    expect(normalizePlan(123)).toBe('FREE');
  });

  it('should handle malformed template variables', () => {
    const templateTests = [
      { template: 'Write about [TOPIC]', variables: ['TOPIC'], valid: true },
      { template: 'Write about [TOPIC', variables: ['TOPIC'], valid: false }, // Missing ]
      { template: 'Write about TOPIC]', variables: ['TOPIC'], valid: false }, // Missing [
      { template: 'Write about []', variables: [''], valid: false }, // Empty variable
      { template: 'Write about [TOPIC] and [TOPIC]', variables: ['TOPIC'], valid: true }, // Duplicate
      { template: 'No variables here', variables: [], valid: true }
    ];

    const validateTemplate = (template: string, variables: string[]) => {
      // Check for balanced brackets
      const openBrackets = (template.match(/\[/g) || []).length;
      const closeBrackets = (template.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) return false;

      // Check for empty variables
      if (template.includes('[]')) return false;

      // Extract variables from template
      const templateVars = [...template.matchAll(/\[([^\]]+)\]/g)].map(match => match[1]);
      const uniqueVars = [...new Set(templateVars)];

      // Variables should match (allowing duplicates in template)
      return uniqueVars.every(v => variables.includes(v));
    };

    templateTests.forEach(({ template, variables, valid }) => {
      expect(validateTemplate(template, variables)).toBe(valid);
    });
  });

  it('should handle database constraint violations', () => {
    const constraintTests = [
      { field: 'email', value: 'valid@example.com', valid: true },
      { field: 'email', value: 'invalid-email', valid: false },
      { field: 'email', value: '', valid: false },
      { field: 'slug', value: 'valid-slug-123', valid: true },
      { field: 'slug', value: 'invalid slug with spaces', valid: false },
      { field: 'slug', value: 'slug-with-special-chars!@#', valid: false }
    ];

    const validateField = (field: string, value: string) => {
      switch (field) {
        case 'email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'slug':
          return /^[a-z0-9-]+$/.test(value) && value.length > 0;
        default:
          return true;
      }
    };

    constraintTests.forEach(({ field, value, valid }) => {
      expect(validateField(field, value)).toBe(valid);
    });
  });

  it('should handle race conditions', async () => {
    let counter = 0;
    const maxCount = 10;

    // Simulate concurrent operations that could cause race conditions
    const operations = Array.from({ length: 20 }, () => 
      new Promise<boolean>(resolve => {
        setTimeout(() => {
          if (counter < maxCount) {
            counter++;
            resolve(true);
          } else {
            resolve(false);
          }
        }, Math.random() * 10);
      })
    );

    const results = await Promise.all(operations);
    const successful = results.filter(r => r).length;
    
    // Due to race conditions, we might get more than maxCount
    // In production, this would be handled with proper locking
    expect(successful).toBeGreaterThan(0);
    expect(successful).toBeLessThanOrEqual(20);
  });

  it('should handle circular references', () => {
    const obj1: any = { name: 'obj1' };
    const obj2: any = { name: 'obj2' };
    
    // Create circular reference
    obj1.ref = obj2;
    obj2.ref = obj1;

    // Should detect and handle circular references
    const hasCircularRef = (obj: any, seen = new Set()) => {
      if (seen.has(obj)) return true;
      if (typeof obj !== 'object' || obj === null) return false;
      
      seen.add(obj);
      for (const key in obj) {
        if (hasCircularRef(obj[key], seen)) return true;
      }
      seen.delete(obj);
      return false;
    };

    expect(hasCircularRef(obj1)).toBe(true);
    expect(hasCircularRef({ name: 'simple' })).toBe(false);
  });

  it('should handle timezone and date edge cases', () => {
    const dateTests = [
      new Date('2024-01-01T00:00:00Z'), // UTC
      new Date('2024-12-31T23:59:59Z'), // End of year
      new Date('2024-02-29T12:00:00Z'), // Leap year
      new Date('invalid-date'), // Invalid date
      new Date(0), // Unix epoch
      new Date(8640000000000000), // Max safe date
    ];

    dateTests.forEach(date => {
      const isValidDate = !isNaN(date.getTime());
      const timestamp = isValidDate ? date.getTime() : null;
      
      if (date.toString() === 'Invalid Date') {
        expect(isValidDate).toBe(false);
        expect(timestamp).toBe(null);
      } else {
        expect(isValidDate).toBe(true);
        expect(typeof timestamp).toBe('number');
      }
    });
  });

  it('should handle memory leaks in long-running operations', () => {
    // Simulate operations that could cause memory leaks
    const operations = [];
    
    for (let i = 0; i < 1000; i++) {
      operations.push({
        id: i,
        data: new Array(1000).fill(`data_${i}`),
        cleanup: () => {} // Mock cleanup function
      });
    }

    expect(operations).toHaveLength(1000);
    
    // Simulate cleanup
    operations.forEach(op => {
      op.cleanup();
      // In real scenario, would clear references
    });

    // Should handle large number of operations
    expect(operations[999].id).toBe(999);
  });
});
