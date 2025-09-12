import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userId?: string;
  timestamp: Date;
}

interface DatabaseMetric {
  query: string;
  duration: number;
  timestamp: Date;
}

export class PerformanceService {
  private static instance: PerformanceService;

  private constructor() {}

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  async trackAPIPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      // Store in WebVital table for now, could create dedicated table
      await prisma.webVital.create({
        data: {
          name: `api_${metric.endpoint}_${metric.method}`,
          value: metric.responseTime,
          rating: metric.responseTime < 200 ? 'good' : metric.responseTime < 500 ? 'needs-improvement' : 'poor',
          timestamp: metric.timestamp,
          userId: metric.userId,
        },
      });
    } catch (error) {
      // Don't throw errors for monitoring to avoid breaking main functionality
      console.error('Failed to track API performance:', error);
    }
  }

  async trackDatabasePerformance(metric: DatabaseMetric): Promise<void> {
    try {
      await prisma.webVital.create({
        data: {
          name: `db_query`,
          value: metric.duration,
          rating: metric.duration < 50 ? 'good' : metric.duration < 200 ? 'needs-improvement' : 'poor',
          timestamp: metric.timestamp,
        },
      });
    } catch (error) {
      console.error('Failed to track database performance:', error);
    }
  }

  async getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<{
    avgResponseTime: number;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
    errorRate: number;
  }> {
    try {
      const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const metrics = await prisma.webVital.findMany({
        where: {
          name: { startsWith: 'api_' },
          timestamp: { gte: since },
        },
      });

      const avgResponseTime = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length || 0;
      
      const endpointGroups = metrics.reduce((acc, metric) => {
        const endpoint = metric.name.replace('api_', '');
        if (!acc[endpoint]) acc[endpoint] = [];
        acc[endpoint].push(metric.value);
        return acc;
      }, {} as Record<string, number[]>);

      const slowestEndpoints = Object.entries(endpointGroups)
        .map(([endpoint, times]) => ({
          endpoint,
          avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 5);

      const errorRate = metrics.filter(m => m.rating === 'poor').length / metrics.length || 0;

      return { avgResponseTime, slowestEndpoints, errorRate };
    } catch (error) {
      throw new ServiceError('Failed to get performance metrics', 'PERFORMANCE_METRICS_FAILED', 500);
    }
  }
}
