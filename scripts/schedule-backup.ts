import { BackupService } from '@/lib/services/backup-service';
import { scheduleJob } from 'node-schedule';

// Schedule backup to run daily at 2 AM UTC
const BACKUP_SCHEDULE = '0 2 * * *';

async function runScheduledBackup() {
  try {
    const backupService = BackupService.getInstance();
    await backupService.createBackup();
    console.log(`[${new Date().toISOString()}] Backup completed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Backup failed:`, error);
  }
}

// Schedule the backup job
scheduleJob(BACKUP_SCHEDULE, runScheduledBackup);

console.log(`Backup scheduler started. Next backup scheduled at ${new Date().toISOString()}`);

// Keep the process running
process.on('SIGINT', () => {
  console.log('Backup scheduler stopped');
  process.exit(0);
});
