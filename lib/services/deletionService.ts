import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export class DeletionService {
  private static instance: DeletionService;

  private constructor() {}

  public static getInstance(): DeletionService {
    if (!DeletionService.instance) {
      DeletionService.instance = new DeletionService();
    }
    return DeletionService.instance;
  }

  /**
   * Initiates the user deletion process
   */
  async initiateDeletion(userId: string, reason?: string): Promise<void> {
    try {
      // 1. Create deletion audit log
      await prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'DELETION_REQUESTED',
          details: { reason },
          timestamp: new Date(),
        },
      });

      // 2. Update user with deletion request
      await prisma.user.update({
        where: { id: userId },
        data: {
          dataDeletionRequest: new Date(),
          deletionReason: reason,
        },
      });

      // 3. Notify user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Account Deletion Request Received',
          template: 'account-deletion-request',
          data: {
            retentionPeriod: '30 days',
            contactEmail: process.env.PRIVACY_EMAIL,
          },
        });
      }

      logger.info('Deletion request initiated', { userId });
    } catch (error) {
      logger.error('Failed to initiate deletion', { userId, error });
      throw new Error('Failed to initiate account deletion');
    }
  }

  /**
   * Anonymizes user data while maintaining necessary records
   */
  async anonymizeUserData(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          imageUrl: true,
          clerkId: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 1. Create deleted user record
      await prisma.deletedUser.create({
        data: {
          originalUserId: userId,
          originalEmail: user.email || '',
          originalName: user.name || '',
          deletionDate: new Date(),
          retentionPeriod: 30, // 30 days retention
          dataSnapshot: {
            clerkId: user.clerkId,
            lastActive: new Date(),
          },
        },
      });

      // 2. Anonymize user data
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@deleted.user`,
          name: 'Deleted User',
          imageUrl: null,
          isAnonymized: true,
          anonymizedAt: new Date(),
        },
      });

      // 3. Log the anonymization
      await prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'DATA_ANONYMIZED',
          timestamp: new Date(),
        },
      });

      logger.info('User data anonymized', { userId });
    } catch (error) {
      logger.error('Failed to anonymize user data', { userId, error });
      throw new Error('Failed to anonymize user data');
    }
  }

  /**
   * Permanently deletes user data after retention period
   */
  async permanentDeletion(userId: string): Promise<void> {
    try {
      // 1. Verify retention period has passed
      const deletedUser = await prisma.deletedUser.findFirst({
        where: { originalUserId: userId },
      });

      if (!deletedUser) {
        throw new Error('No deletion record found');
      }

      const retentionEndDate = new Date(deletedUser.deletionDate);
      retentionEndDate.setDate(retentionEndDate.getDate() + deletedUser.retentionPeriod);

      if (new Date() < retentionEndDate) {
        throw new Error('Retention period not yet passed');
      }

      // 2. Log the permanent deletion
      await prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'PERMANENT_DELETION',
          timestamp: new Date(),
        },
      });

      // 3. Delete the user (this will cascade delete related records)
      await prisma.user.delete({
        where: { id: userId },
      });

      // 4. Delete the deleted user record
      await prisma.deletedUser.delete({
        where: { id: deletedUser.id },
      });

      logger.info('User permanently deleted', { userId });
    } catch (error) {
      logger.error('Failed to permanently delete user', { userId, error });
      throw new Error('Failed to permanently delete user');
    }
  }

  /**
   * Handles the complete deletion process
   */
  async handleDeletion(userId: string, reason?: string): Promise<void> {
    try {
      // 1. Initiate deletion
      await this.initiateDeletion(userId, reason);

      // 2. Anonymize data
      await this.anonymizeUserData(userId);

      // 3. Schedule permanent deletion
      const retentionPeriod = 30; // days
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + retentionPeriod);

      // Note: In a production environment, you would use a job scheduler
      // like Bull or a cloud function to handle the delayed deletion
      setTimeout(async () => {
        try {
          await this.permanentDeletion(userId);
        } catch (error) {
          logger.error('Failed to execute scheduled deletion', { userId, error });
        }
      }, retentionPeriod * 24 * 60 * 60 * 1000);

      logger.info('Deletion process completed', { userId });
    } catch (error) {
      logger.error('Failed to handle deletion process', { userId, error });
      throw new Error('Failed to handle deletion process');
    }
  }

  /**
   * Recovers a user's account during the retention period
   */
  async recoverAccount(userId: string): Promise<void> {
    try {
      const deletedUser = await prisma.deletedUser.findFirst({
        where: { originalUserId: userId },
      });

      if (!deletedUser) {
        throw new Error('No deletion record found');
      }

      // 1. Restore user data
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: deletedUser.originalEmail,
          name: deletedUser.originalName,
          isAnonymized: false,
          anonymizedAt: null,
          dataDeletionRequest: null,
          deletionReason: null,
        },
      });

      // 2. Log the recovery
      await prisma.deletionAuditLog.create({
        data: {
          userId,
          action: 'ACCOUNT_RECOVERED',
          timestamp: new Date(),
        },
      });

      // 3. Delete the deleted user record
      await prisma.deletedUser.delete({
        where: { id: deletedUser.id },
      });

      // 4. Notify user
      if (deletedUser.originalEmail) {
        await sendEmail({
          to: deletedUser.originalEmail,
          subject: 'Account Recovery Successful',
          template: 'account-recovered',
        });
      }

      logger.info('Account recovered', { userId });
    } catch (error) {
      logger.error('Failed to recover account', { userId, error });
      throw new Error('Failed to recover account');
    }
  }
} 