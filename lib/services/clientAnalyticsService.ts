export const clientAnalyticsService = {
  async trackPromptView(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/prompts/${id}/view`, {
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

  async trackPromptUsage(id: string, result: any): Promise<void> {
    try {
      const response = await fetch(`/api/prompts/${id}/usage`, {
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

  async trackPromptCopy(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/prompts/${id}/copy`, {
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