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
      await prisma.errorLog.create({
        data: {
          userId,
          error: error.message,
          stack: error.stack,
          context: JSON.stringify(context),
          severity
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
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
    const errors = await prisma.errorLog.groupBy({
      by: ['severity'],
      _count: { severity: true },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const bySeverity = errors.reduce((acc, item) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(bySeverity).reduce((sum, count) => sum + count, 0);

    return { total, bySeverity };
  }
}
