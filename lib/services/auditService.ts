import { prisma } from '@/lib/prisma';
import { getRequestId } from '@/middleware/request-id';
import type { NextRequest } from 'next/server';

export type AuditLogAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'API_CALL'
  | 'SECURITY_EVENT'
  | 'DATA_ACCESS'
  | 'CONFIGURATION_CHANGE'
  | 'QUOTA_CHECK';

export interface AuditLogEntry {
  action: AuditLogAction;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource: string;
  details: Record<string, any>;
  status?: string;
}

export class AuditService {
  private static instance: AuditService;
  private request?: NextRequest;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public setRequest(request: NextRequest) {
    this.request = request;
  }

  public async log(entry: AuditLogEntry): Promise<void> {
    try {
      const requestId = this.request ? getRequestId(this.request) : undefined;
      const ipAddress = this.request?.headers.get('x-forwarded-for') || entry.ipAddress || '';
      const userAgent = this.request?.headers.get('user-agent') || entry.userAgent || '';

      await AuditService.logAction({
        action: entry.action,
        userId: entry.userId || null,
        ipAddress: ipAddress || null,
        resource: entry.resource,
        status: entry.status || 'SUCCESS',
        details: {
          ...entry.details,
          requestId,
          userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw the error to prevent disrupting the main application flow
    }
  }

  public async logSecurityEvent(
    action: AuditLogAction,
    resource: string,
    details: Record<string, any>,
    status?: string
  ): Promise<void> {
    await this.log({
      action,
      resource,
      details,
      status,
    });
  }

  public async logUserAction(
    userId: string,
    action: AuditLogAction,
    resource: string,
    details: Record<string, any>,
    status?: string
  ): Promise<void> {
    await this.log({
      action,
      userId,
      resource,
      details,
      status,
    });
  }

  public async logApiCall(
    userId: string,
    resource: string,
    details: Record<string, any>,
    status?: string
  ): Promise<void> {
    await this.log({
      action: 'API_CALL',
      userId,
      resource,
      details,
      status,
    });
  }

  public static async logAction({
    action,
    resource,
    userId,
    ipAddress,
    details,
    status = 'success',
  }: {
    action: string;
    resource: string;
    userId: string | null;
    ipAddress: string | null;
    details: any;
    status?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        action,
        resource,
        userId,
        ipAddress,
        details,
        status,
      },
    });
  }

  public static async getRecentLogs(limit = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  public static async getLogsByAction(action: string) {
    return prisma.auditLog.findMany({
      where: {
        action,
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  public static async getLogsByStatus(status: string) {
    return prisma.auditLog.findMany({
      where: {
        status,
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  public static async searchLogs(query: string) {
    return prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { resource: { contains: query, mode: 'insensitive' } },
          { details: { path: ['$'], string_contains: query } },
        ],
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
