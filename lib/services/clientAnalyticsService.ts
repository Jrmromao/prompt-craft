export const clientAnalyticsService = {
  async trackPromptView(promptId: string): Promise<void> {
    try {
      const response = await fetch(`/api/prompts/${promptId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to track view');
      }
    } catch (error) {
      console.error('Error tracking prompt view:', error);
      throw error;
    }
  },

  async trackPromptUsage(promptId: string, result: any): Promise<void> {
    try {
      const response = await fetch(`/api/prompts/${promptId}/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) {
        throw new Error('Failed to track usage');
      }
    } catch (error) {
      console.error('Error tracking prompt usage:', error);
      throw error;
    }
  },

  async trackPromptCopy(promptId: string): Promise<void> {
    try {
      const response = await fetch(`/api/prompts/${promptId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to track copy');
      }
    } catch (error) {
      console.error('Error tracking prompt copy:', error);
      throw error;
    }
  }
}; 