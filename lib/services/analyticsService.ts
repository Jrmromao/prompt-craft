export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Get dashboard overview stats
  public async getDashboardOverview() {
    const data = await this.getAnalytics();
    return data.dashboardOverview;
  }

  // Dashboard metrics helpers
  public async getTotalUsers() {
    const data = await this.getAnalytics();
    return data.totalUsers;
  }

  public async getTotalPrompts() {
    const data = await this.getAnalytics();
    return data.totalPrompts;
  }

  public async getTotalUsage() {
    const data = await this.getAnalytics();
    return data.totalUsage;
  }

  public async getUserGrowth() {
    const data = await this.getAnalytics();
    return data.userGrowth;
  }

  public async getPromptUsageGrowth() {
    const data = await this.getAnalytics();
    return data.promptUsageGrowth;
  }

  public async getPlanDistribution() {
    const data = await this.getAnalytics();
    return data.planDistribution;
  }

  public async getAnalytics() {
    try {
      const response = await fetch('http://localhost:3000/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  public async getRecentLogs() {
    const data = await this.getAnalytics();
    return data.recentLogs;
  }

  // Get prompt analytics
  public async getPromptAnalytics(promptId: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/prompts/${promptId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prompt analytics:', error);
      throw error;
    }
  }

  // Get user's prompt analytics
  public async getUserPromptAnalytics(userId: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/prompt-analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user prompt analytics:', error);
      throw error;
    }
  }
} 