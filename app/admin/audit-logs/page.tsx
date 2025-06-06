import { AuditService } from "@/lib/services/auditService";
import { AuditLogs } from "../components/AuditLogs";

export default async function AuditLogsPage() {
  const logs = await AuditService.getRecentLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and export system audit logs
        </p>
      </div>

      <AuditLogs logs={logs} />
    </div>
  );
} 