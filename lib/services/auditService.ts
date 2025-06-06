import { prisma } from '@/lib/prisma';

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
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
