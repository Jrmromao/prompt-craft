import { prisma } from '@/lib/prisma';
import { AuditAction } from '@/app/constants/audit';

interface AuditLogParams {
  action: AuditAction;
  userId?: string; // user performing the action
  resource: string; // e.g., 'user', 'role', 'subscription'
  status?: string; // e.g., 'success', 'failure'
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit({
  action,
  userId,
  resource,
  status = 'success',
  details = {},
  ipAddress,
}: AuditLogParams) {
  await prisma.auditLog.create({
    data: {
      action,
      userId,
      resource,
      status,
      details,
      ipAddress,
    },
  });
} 