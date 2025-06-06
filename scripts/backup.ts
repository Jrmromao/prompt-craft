import { BackupService } from "../services/backup-service";

async function runBackup() {
  try {
    const backupService = BackupService.getInstance();
    await backupService.createBackup();
    console.log("Backup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
}

// Run the backup
runBackup(); 