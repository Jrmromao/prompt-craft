/**
 * This file is a work in progress and is not yet complete.
 * It is a placeholder for the actual deletion service.
 * It is not used in the current version of the app.
 * It is only here to help us understand the deletion service and how it works.
 * It is not used in the current version of the app.
 */

import type { Prisma as PrismaTypes } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/emailService';
import { logger } from '@/lib/utils/logger';

// Constants
const DEFAULT_RETENTION_PERIOD_DAYS = 30;
const DELETED_USER_EMAIL_PREFIX = 'deleted_';
const DELETED_USER_EMAIL_DOMAIN = '@deleted.user';
const DELETED_USER_NAME = 'Deleted User';

// Fallback types for sendEmail and logger if type declarations are missing
// (Remove if you have proper types in your project)
type SendEmailType = typeof EmailService;
type LoggerType = typeof logger;

// Custom error class for granular error handling
class DeletionServiceError extends Error {
  constructor(message: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = 'DeletionServiceError';
  }
}

/**
 * Service for handling user deletion, anonymization, and recovery.
 * Dependencies can be injected for testability.
 */
export class DeletionService {
  private static instance: DeletionService;
  private prisma: typeof defaultPrisma;
  private emailService: EmailService;
  private logger: typeof logger;

  private constructor(
    prisma = defaultPrisma,
    emailService = EmailService.getInstance(),
    loggerInstance = logger
  ) {
    this.prisma = prisma;
    this.emailService = emailService;
    this.logger = loggerInstance;
  }

  /**
   * Singleton accessor
   */
  public static getInstance(): DeletionService {
    if (!DeletionService.instance) {
      DeletionService.instance = new DeletionService();
    }
    return DeletionService.instance;
  }

  /**
   * Initiates the user deletion process
   * @param userId User ID
   * @param reason Optional reason for deletion
   */
  async initiateDeletion(userId: string, reason?: string): Promise<void> {
    try {
      if (!userId) throw new DeletionServiceError('User ID is required');
      // If you get an error about 'deletionAuditLog' not existing, check your schema.prisma for the model
      await this.prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'DELETION_REQUESTED',
          details: { reason } as unknown as PrismaTypes.JsonObject,
          timestamp: new Date(),
        },
      });

      // 2. Update user with deletion request
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dataDeletionRequest: new Date(),
        },
      });

      // 3. Notify user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email && user?.name) {
        await this.emailService.sendGDPRAccountDeletionNotification(user.email, user.name);
      }

      this.logger.info('Deletion request initiated', { userId });
    } catch (error) {
      this.logger.error('Failed to initiate deletion', { userId, error });
      throw new DeletionServiceError('Failed to initiate account deletion', { userId, error });
    }
  }

  /**
   * Anonymizes user data while maintaining necessary records
   * @param userId User ID
   */
  async anonymizeUserData(userId: string): Promise<void> {
    try {
      if (!userId) throw new DeletionServiceError('User ID is required');
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          imageUrl: true,
          clerkId: true,
        },
      });

      if (!user) {
        throw new DeletionServiceError('User not found', { userId });
      }

      // If you get an error about 'deletedUser' not existing, check your schema.prisma for the model
      await this.prisma.deletedUser.create({
        data: {
          originalUserId: userId,
          originalEmail: user.email || '',
          originalName: user.name || '',
          deletionDate: new Date(),
          retentionPeriod: DEFAULT_RETENTION_PERIOD_DAYS,
          dataSnapshot: {
            clerkId: user.clerkId,
            lastActive: new Date().toISOString(), // Store as ISO string for JSON compatibility
          } as unknown as PrismaTypes.JsonObject,
        },
      });

      // 2. Anonymize user data
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: `${DELETED_USER_EMAIL_PREFIX}${userId}${DELETED_USER_EMAIL_DOMAIN}`,
          name: DELETED_USER_NAME,
          imageUrl: null,
        },
      });

      // 3. Log the anonymization
      await this.prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'DATA_ANONYMIZED',
          timestamp: new Date(),
        },
      });

      this.logger.info('User data anonymized', { userId });
    } catch (error) {
      this.logger.error('Failed to anonymize user data', { userId, error });
      throw new DeletionServiceError('Failed to anonymize user data', { userId, error });
    }
  }

  /**
   * Permanently deletes user data after retention period
   * @param userId User ID
   */
  async permanentDeletion(userId: string): Promise<void> {
    try {
      if (!userId) throw new DeletionServiceError('User ID is required');
      // If you get an error about 'deletedUser' not existing, check your schema.prisma for the model
      const deletedUser = await this.prisma.deletedUser.findFirst({
        where: { originalUserId: userId },
      });

      if (!deletedUser) {
        throw new DeletionServiceError('No deletion record found', { userId });
      }

      const retentionEndDate = new Date(deletedUser.deletionDate);
      retentionEndDate.setDate(retentionEndDate.getDate() + deletedUser.retentionPeriod);

      if (new Date() < retentionEndDate) {
        throw new DeletionServiceError('Retention period not yet passed', { userId });
      }

      // 2. Log the permanent deletion
      await this.prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'PERMANENT_DELETION',
          timestamp: new Date(),
        },
      });

      // 3. Delete the user (this will cascade delete related records)
      await this.prisma.user.delete({
        where: { id: userId },
      });

      // 4. Delete the deleted user record
      await this.prisma.deletedUser.delete({
        where: { id: deletedUser.id },
      });

      this.logger.info('User permanently deleted', { userId });
    } catch (error) {
      this.logger.error('Failed to permanently delete user', { userId, error });
      throw new DeletionServiceError('Failed to permanently delete user', { userId, error });
    }
  }

  /**
   * Handles the complete deletion process
   * @param userId User ID
   * @param reason Optional reason for deletion
   * @param scheduleJob Optional callback for scheduling permanent deletion (for testability/production)
   */
  async handleDeletion(
    userId: string,
    reason?: string,
    scheduleJob?: (fn: () => Promise<void>, delayMs: number) => void
  ): Promise<void> {
    try {
      if (!userId) throw new DeletionServiceError('User ID is required');
      // 1. Initiate deletion
      await this.initiateDeletion(userId, reason);

      // 2. Anonymize data
      await this.anonymizeUserData(userId);

      // 3. Schedule permanent deletion
      const retentionPeriod = DEFAULT_RETENTION_PERIOD_DAYS;
      const delayMs = retentionPeriod * 24 * 60 * 60 * 1000;
      const job = async () => {
        try {
          await this.permanentDeletion(userId);
        } catch (error) {
          this.logger.error('Failed to execute scheduled deletion', { userId, error });
        }
      };
      if (scheduleJob) {
        scheduleJob(job, delayMs);
      } else {
        // Fallback: setTimeout (not reliable for production)
        setTimeout(job, delayMs);
      }

      this.logger.info('Deletion process completed', { userId });
    } catch (error) {
      this.logger.error('Failed to handle deletion process', { userId, error });
      throw new DeletionServiceError('Failed to handle deletion process', { userId, error });
    }
  }

  /**
   * Recovers a user's account during the retention period
   * @param userId User ID
   */
  async recoverAccount(userId: string): Promise<void> {
    try {
      if (!userId) throw new DeletionServiceError('User ID is required');
      // If you get an error about 'deletedUser' not existing, check your schema.prisma for the model
      const deletedUser = await this.prisma.deletedUser.findFirst({
        where: { originalUserId: userId },
      });

      if (!deletedUser) {
        throw new DeletionServiceError('No deletion record found', { userId });
      }

      // 1. Restore user data
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: deletedUser.originalEmail,
          name: deletedUser.originalName,
          dataDeletionRequest: null,
        },
      });

      // 2. Log the recovery
      await this.prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'ACCOUNT_RECOVERED',
          timestamp: new Date(),
        },
      });

      // 3. Delete the deleted user record
      await this.prisma.deletedUser.delete({
        where: { id: deletedUser.id },
      });

      // 4. Notify user
      if (deletedUser.originalEmail && deletedUser.originalName) {
        await this.emailService.sendGDPRAccountDeletionNotification(
          deletedUser.originalEmail,
          deletedUser.originalName
        );
      }

      this.logger.info('Account recovered', { userId });
    } catch (error) {
      this.logger.error('Failed to recover account', { userId, error });
      throw new DeletionServiceError('Failed to recover account', { userId, error });
    }
  }
} 