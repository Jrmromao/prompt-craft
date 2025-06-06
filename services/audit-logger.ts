import { AuditService } from '@/lib/services/auditService';
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
  | 'CONFIGURATION_CHANGE';

export interface AuditLogEntry {
  action: AuditLogAction;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource: string;
  details: Record<string, any>;
  status?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private request?: NextRequest;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
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
}
