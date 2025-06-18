import { prisma } from '@/lib/prisma';
import { AuditService } from './auditService';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { AuditAction } from '@/app/constants/audit';

export class BackupService {
  private static instance: BackupService;
  private s3Client: S3Client;
  private auditLogger: AuditService;

  private constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.auditLogger = AuditService.getInstance();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  public async createBackup(): Promise<void> {
    try {
      // Get all data from the database
      const data = await this.getAllData();

      // Compress the data
      const compressedData = await this.compressData(data);

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json.gz`;

      // Upload to S3
      await this.uploadToS3(compressedData, filename);

      // Log the backup
      await this.auditLogger.logAudit(
        {
          userId: 'system',
          action: AuditAction.BACKUP,
          resource: 'backup',
          status: 'success',
          details: {
          filename,
          timestamp,
          size: compressedData.length,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Backup failed:', error);
      await this.auditLogger.logAudit(
        {
          userId: 'system',
          action: AuditAction.BACKUP,
          resource: 'backup',
          status: 'failure',
          details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private async getAllData(): Promise<Record<string, any>> {
    const [
      users,
      prompts,
      comments,
      apiKeys,
      auditLogs,
      // Add other models as needed
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.prompt.findMany(),
      prisma.comment.findMany(),
      prisma.apiKey.findMany(),
      prisma.auditLog.findMany(),
      // Add other model queries as needed
    ]);

    return {
      users,
      prompts,
      comments,
      apiKeys,
      auditLogs,
      // Add other models as needed
    };
  }

  private async compressData(data: Record<string, any>): Promise<Buffer> {
    const jsonString = JSON.stringify(data);
    const gzip = createGzip();
    const input = Readable.from(jsonString);
    const chunks: Buffer[] = [];

    await pipeline(input, gzip, async source => {
      for await (const chunk of source) {
        chunks.push(chunk);
      }
    });

    return Buffer.concat(chunks);
  }

  private async uploadToS3(data: Buffer, filename: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BACKUP_BUCKET!,
      Key: `backups/${filename}`,
      Body: data,
      ContentType: 'application/gzip',
    });

    await this.s3Client.send(command);
  }
}
