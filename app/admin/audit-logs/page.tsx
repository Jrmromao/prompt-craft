import { AuditService } from '@/lib/services/auditService';
import { AuditLogs } from '../components/AuditLogs';
import { auth } from '@clerk/nextjs/server';
import type { AuditLogEntry } from '@/lib/services/auditService';


export default async function AuditLogsPage() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const logs = (await AuditService.getInstance().getAuditLogs(userId, {
    limit: 100,
  })).filter(log => log.id !== undefined).map(log => ({
    id: log.id!,
    action: log.action,
    resource: log.resource,
    userId: log.userId,
    ipAddress: log.ipAddress || null,
    status: log.status || 'success',
    details: log.details,
    timestamp: log.timestamp || new Date(),
    user: log.user
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">View and export system audit logs</p>
      </div>

      <AuditLogs logs={logs} />
    </div>
  );
}
