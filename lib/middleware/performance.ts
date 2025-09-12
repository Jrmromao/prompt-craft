import { NextRequest, NextResponse } from 'next/server';
import { PerformanceService } from '@/lib/services/PerformanceService';

export function withPerformanceMonitoring(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const performanceService = PerformanceService.getInstance();
    
    try {
      const response = await handler(req, context);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Track performance asynchronously
      setImmediate(() => {
        performanceService.trackAPIPerformance({
          endpoint: req.nextUrl.pathname,
          method: req.method,
          responseTime,
          statusCode: response.status,
          timestamp: new Date(startTime),
        });
      });

      return response;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Track error performance
      setImmediate(() => {
        performanceService.trackAPIPerformance({
          endpoint: req.nextUrl.pathname,
          method: req.method,
          responseTime,
          statusCode: 500,
          timestamp: new Date(startTime),
        });
      });

      throw error;
    }
  };
}
