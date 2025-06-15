import { PrismaClient, Prisma } from '@prisma/client';
import { AuditAction } from '@/app/constants/audit';
import { ServiceError } from './types';

const prisma = new PrismaClient();

export interface AuditLogEntry {
  id?: string;
  userId: string | null;
  action: AuditAction;
  resource: string;
  details: Prisma.InputJsonValue;
  status?: string;
  ipAddress?: string | null;
  timestamp?: Date;
  user?: {
    name: string | null;
  } | null;
}

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public async logAudit(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          details: entry.details,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  public async getAuditLogs(userId: string, options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogEntry[]> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          userId,
          ...(options?.action && { action: options.action }),
          ...(options?.resource && { resource: options.resource }),
          ...(options?.startDate && { timestamp: { gte: options.startDate } }),
          ...(options?.endDate && { timestamp: { lte: options.endDate } }),
        },
        orderBy: { timestamp: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      return logs.map(log => ({
        id: log.id,
        userId: log.userId,
        action: log.action as AuditAction,
        resource: log.resource,
        details: log.details as Prisma.InputJsonValue,
        status: log.status,
        ipAddress: log.ipAddress,
        timestamp: log.timestamp,
        user: log.user,
      }));
    } catch (error) {
      throw new ServiceError('Failed to fetch audit logs', 'AUDIT_LOG_FETCH_ERROR');
    }
  }
}
