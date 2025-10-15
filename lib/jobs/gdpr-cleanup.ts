import { GDPRService } from '@/lib/services/GDPRService';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';

export class GDPRCleanupJob {
  private static instance: GDPRCleanupJob;
  private gdprService: GDPRService;
  private auditService: AuditService;

  private constructor() {
    this.gdprService = GDPRService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): GDPRCleanupJob {
    if (!GDPRCleanupJob.instance) {
      GDPRCleanupJob.instance = new GDPRCleanupJob();
    }
    return GDPRCleanupJob.instance;
  }

  async run(): Promise<void> {
    try {
      
      await this.gdprService.executeScheduledDeletions();
      
      await this.auditService.logAudit({
        userId: 'system',
        action: AuditAction.GDPR_CLEANUP_COMPLETED,
        resource: 'system',
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          jobType: 'scheduled_deletion',
        }),
      });

    } catch (error) {
      console.error('GDPR cleanup job failed:', error);
      
      await this.auditService.logAudit({
        userId: 'system',
        action: AuditAction.GDPR_CLEANUP_FAILED,
        resource: 'system',
        details: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
      });
      
      throw error;
    }
  }
}

// Export function for cron job or API endpoint
export async function runGDPRCleanup(): Promise<void> {
  const job = GDPRCleanupJob.getInstance();
  await job.run();
}
