import { headers } from 'next/headers';

export class MetricsService {
  private static instance: MetricsService;

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public async trackUsage(data: {
    userId: string;
    type: string;
    tokenCount: number;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      const headersList = headers();
      const host = headersList.get('host');
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;

      const response = await fetch(`${baseUrl}/api/metrics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to track metrics:', await response.text());
      }
    } catch (error) {
      console.error('Error tracking metrics:', error);
    }
  }
} 