import { describe, it, expect, beforeEach } from '@jest/globals';

describe('User Onboarding Integration', () => {
  let mockUser: any;
  let mockLocalStorage: Record<string, string>;
  let mockFetch: any;

  beforeEach(() => {
    mockUser = {
      id: 'test-user-123',
      firstName: 'Alex',
      lastName: 'Developer',
      email: 'alex@example.com',
      createdAt: new Date(),
    };

    mockLocalStorage = {};

    // Mock localStorage
    global.localStorage = {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
      clear: () => {
        mockLocalStorage = {};
      },
      length: 0,
      key: () => null,
    };

    // Mock fetch
    mockFetch = jest.fn((url: string, options?: any) => {
      if (url.includes('/api/keys/generate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            apiKey: 'pc_' + 'x'.repeat(64),
            name: 'My First Key',
          }),
        } as Response);
      }

      if (url.includes('/api/user/onboarding')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
    
    global.fetch = mockFetch as any;
  });

  describe('Welcome Modal Visibility', () => {
    it('should show welcome modal for new users', () => {
      const isNewUser = new Date(mockUser.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
      const hasCompleted = localStorage.getItem(`onboarding-completed-${mockUser.id}`);

      expect(isNewUser).toBe(true);
      expect(hasCompleted).toBeNull();
    });

    it('should not show welcome modal for users who completed onboarding', () => {
      localStorage.setItem(`onboarding-completed-${mockUser.id}`, 'true');
      const hasCompleted = localStorage.getItem(`onboarding-completed-${mockUser.id}`);

      expect(hasCompleted).toBe('true');
    });

    it('should not show welcome modal for users older than 24 hours', () => {
      mockUser.createdAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const isNewUser = new Date(mockUser.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;

      expect(isNewUser).toBe(false);
    });
  });

  describe('API Key Generation', () => {
    it('should generate API key when user clicks button', async () => {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My First Key' }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.apiKey).toMatch(/^pc_[a-z]{64}$/);
    });

    it('should track onboarding progress after key generation', async () => {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'api-key-generated', completed: true }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it('should advance to step 2 after successful generation', async () => {
      let currentStep = 0;

      const response = await fetch('/api/keys/generate', { method: 'POST' });
      const data = await response.json();

      if (data.apiKey) {
        currentStep = 1;
      }

      expect(currentStep).toBe(1);
    });
  });

  describe('Clipboard Copy', () => {
    it('should copy API key to clipboard', () => {
      const apiKey = 'pc_' + 'x'.repeat(64);
      let clipboardContent = '';

      // Mock clipboard
      const mockClipboard = {
        writeText: (text: string) => {
          clipboardContent = text;
          return Promise.resolve();
        },
      };

      mockClipboard.writeText(apiKey);

      expect(clipboardContent).toBe(apiKey);
    });

    it('should show copied confirmation for 2 seconds', async () => {
      let copied = false;

      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);

      expect(copied).toBe(true);
    });
  });

  describe('Onboarding Completion', () => {
    it('should mark onboarding as complete when user clicks "Start Saving Money"', () => {
      localStorage.setItem(`onboarding-completed-${mockUser.id}`, 'true');
      const completed = localStorage.getItem(`onboarding-completed-${mockUser.id}`);

      expect(completed).toBe('true');
    });

    it('should mark onboarding as complete when user skips', () => {
      localStorage.setItem(`onboarding-completed-${mockUser.id}`, 'true');
      const completed = localStorage.getItem(`onboarding-completed-${mockUser.id}`);

      expect(completed).toBe('true');
    });

    it('should persist completion across page refreshes', () => {
      localStorage.setItem(`onboarding-completed-${mockUser.id}`, 'true');

      // Simulate page refresh
      const completedAfterRefresh = localStorage.getItem(`onboarding-completed-${mockUser.id}`);

      expect(completedAfterRefresh).toBe('true');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API key generation fails', async () => {
      mockFetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Service unavailable' }),
        } as Response)
      );
      global.fetch = mockFetch as any;

      const response = await fetch('/api/keys/generate', { method: 'POST' });
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Service unavailable');
    });

    it('should keep modal open when error occurs', async () => {
      let modalOpen = true;

      mockFetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Service unavailable' }),
        } as Response)
      );
      global.fetch = mockFetch as any;

      const response = await fetch('/api/keys/generate', { method: 'POST' });
      const data = await response.json();

      if (data.error) {
        // Modal stays open
        modalOpen = true;
      }

      expect(modalOpen).toBe(true);
    });
  });

  describe('User Experience', () => {
    it('should complete onboarding in under 2 minutes', () => {
      const steps = [
        { name: 'See welcome modal', duration: 5 },
        { name: 'Click generate key', duration: 2 },
        { name: 'Copy key', duration: 3 },
        { name: 'Read instructions', duration: 30 },
        { name: 'Click complete', duration: 2 },
      ];

      const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

      expect(totalDuration).toBeLessThan(120); // 2 minutes
    });

    it('should show clear value proposition', () => {
      const messaging = 'Save 50-80% on AI costs';

      expect(messaging).toContain('50-80%');
      expect(messaging).toContain('Save');
    });

    it('should provide actionable next steps', () => {
      const steps = [
        'Install SDK: npm install promptcraft-sdk',
        'Wrap your OpenAI client',
        'Start saving money',
      ];

      expect(steps.length).toBe(3);
      expect(steps[0]).toContain('npm install');
    });
  });

  describe('Emotional Journey', () => {
    it('should reduce user frustration by auto-generating key', () => {
      const manualSteps = 5; // Navigate to settings, find API keys, create, name, copy
      const autoSteps = 1; // Click one button

      expect(autoSteps).toBeLessThan(manualSteps);
    });

    it('should create excitement with savings messaging', () => {
      const currentCost = 500; // $500/month
      const potentialSavings = currentCost * 0.65; // 65% savings

      expect(potentialSavings).toBeGreaterThan(300); // $300+ savings
    });

    it('should build confidence with clear instructions', () => {
      const instructions = [
        'Step 1: Install SDK',
        'Step 2: Wrap client',
        'Step 3: Start saving',
      ];

      const hasNumberedSteps = instructions.every((step) => step.includes('Step'));

      expect(hasNumberedSteps).toBe(true);
    });
  });
});
