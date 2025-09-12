import { prisma } from '@/lib/prisma';

interface ErrorLog {
  id: string;
  userId?: string;
  error: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  async logError(error: Error, context: Record<string, any> = {}, userId?: string): Promise<void> {
    const severity = this.determineSeverity(error, context);
    
    try {
      // Use Prisma's safe query methods instead of raw SQL
      await prisma.error.create({
        data: {
          userId,
          type: error.name || 'UnknownError',
          message: error.message,
          stack: error.stack || null,
          metadata: JSON.stringify({ context, severity }),
        },
      });
    } catch (logError) {
      // Fallback to console logging if database logging fails
      console.error('Failed to log error to database:', logError);
      console.error('Original error:', error.message, { context, userId, severity });
    }
  }

  private determineSeverity(error: Error, context: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      return 'high';
    }
    if (error.message.includes('validation') || error.message.includes('Invalid')) {
      return 'medium';
    }
    if (context.endpoint?.includes('/api/')) {
      return 'high';
    }
    return 'low';
  }

  async handleApiError(error: Error, req: any, res: any): Promise<void> {
    await this.logError(error, {
      endpoint: req.url,
      method: req.method,
      userAgent: req.headers['user-agent']
    }, req.user?.id);

    const statusCode = this.getStatusCode(error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : error.message;

    res.status(statusCode).json({ error: message });
  }

  private getStatusCode(error: Error): number {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('unauthorized')) return 401;
    if (error.message.includes('validation')) return 400;
    return 500;
  }

  async getErrorStats(): Promise<{ total: number; bySeverity: Record<string, number> }> {
    try {
      // Check if errorLog table exists, if not return empty stats
      const errors = await prisma.$queryRaw`SELECT severity, COUNT(*) as count FROM "ErrorLog" WHERE "timestamp" >= NOW() - INTERVAL '24 hours' GROUP BY severity` as any[];
      
      const bySeverity = errors.reduce((acc, item) => {
        acc[item.severity] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>);

      const total = Object.values(bySeverity).reduce<number>((sum, count) => sum + (count as number), 0);

      return { total, bySeverity };
    } catch (error) {
      // Table doesn't exist or other error, return empty stats
      return { 
        total: 0, 
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 } 
      };
    }
  }
}
