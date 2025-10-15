import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';
import { User } from '@prisma/client';

interface UserDataExport {
  user: any;
  prompts: any[];
  comments: any[];
  votes: any[];
  subscriptions: any[];
  auditLogs: any[];
  exportedAt: Date;
  format: 'JSON';
}

interface DataRetentionPolicy {
  dataType: string;
  retentionDays: number;
  autoDelete: boolean;
}

export class GDPRService {
  private static instance: GDPRService;

  private constructor() {}

  public static getInstance(): GDPRService {
    if (!GDPRService.instance) {
      GDPRService.instance = new GDPRService();
    }
    return GDPRService.instance;
  }

  async exportUserData(userId: string): Promise<UserDataExport> {
    try {
      const [user, prompts, comments, votes, subscriptions, auditLogs] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            settings: true,
            userAchievements: true,
            userBadges: true,
          },
        }),
        prisma.prompt.findMany({
          where: { userId },
          include: { Tag: true, versions: true },
        }),
        prisma.comment.findMany({
          where: { userId },
        }),
        prisma.vote.findMany({
          where: { userId },
        }),
        prisma.subscription.findMany({
          where: { userId },
        }),
        prisma.auditLog.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          take: 1000, // Limit to last 1000 entries
        }),
      ]);

      if (!user) {
        throw new ServiceError('User not found', 'USER_NOT_FOUND', 404);
      }

      return {
        user: this.sanitizeUserData(user),
        prompts: prompts.map(this.sanitizePromptData),
        comments: comments.map(this.sanitizeCommentData),
        votes: votes.map(this.sanitizeVoteData),
        subscriptions: subscriptions.map(this.sanitizeSubscriptionData),
        auditLogs: auditLogs.map(this.sanitizeAuditData),
        exportedAt: new Date(),
        format: 'JSON',
      };
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to export user data', 'DATA_EXPORT_FAILED', 500);
    }
  }

  async scheduleDataDeletion(userId: string, deletionDate: Date): Promise<void> {
    try {
      await prisma.dataRetentionSchedule.create({
        data: {
          userId,
          scheduledDeletion: deletionDate,
          status: 'SCHEDULED',
          requestedAt: new Date(),
        },
      });
    } catch (error) {
      throw new ServiceError('Failed to schedule data deletion', 'DELETION_SCHEDULE_FAILED', 500);
    }
  }

  async executeScheduledDeletions(): Promise<void> {
    try {
      const now = new Date();
      const scheduledDeletions = await prisma.dataRetentionSchedule.findMany({
        where: {
          scheduledDeletion: { lte: now },
          status: 'SCHEDULED',
        },
      });

      for (const deletion of scheduledDeletions) {
        await this.deleteUserData(deletion.userId);
        
        await prisma.dataRetentionSchedule.update({
          where: { id: deletion.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }
    } catch (error) {
      throw new ServiceError('Failed to execute scheduled deletions', 'DELETION_EXECUTION_FAILED', 500);
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete in correct order to respect foreign key constraints
      await prisma.$transaction(async (tx) => {
        // Delete user-related data
        await tx.vote.deleteMany({ where: { userId } });
        await tx.comment.deleteMany({ where: { userId } });
        await tx.promptUsage.deleteMany({ where: { userId } });
        await tx.apiUsage.deleteMany({ where: { userId } });
        await tx.auditLog.deleteMany({ where: { userId } });
        await tx.userOnboarding.deleteMany({ where: { userId } });
        await tx.userSettings.deleteMany({ where: { userId } });
        await tx.subscription.deleteMany({ where: { userId } });
        
        // Delete prompts (will cascade to versions, etc.)
        await tx.prompt.deleteMany({ where: { userId } });
        
        // Finally delete the user
        await tx.user.delete({ where: { id: userId } });
      });
    } catch (error) {
      throw new ServiceError('Failed to delete user data', 'DATA_DELETION_FAILED', 500);
    }
  }

  async trackConsent(userId: string, consentType: string, granted: boolean): Promise<void> {
    try {
      await prisma.userConsent.upsert({
        where: {
          userId_consentType: {
            userId,
            consentType,
          },
        },
        update: {
          granted,
          grantedAt: new Date(),
        },
        create: {
          userId,
          consentType,
          granted,
          grantedAt: new Date(),
        },
      });
    } catch (error) {
      throw new ServiceError('Failed to track consent', 'CONSENT_TRACKING_FAILED', 500);
    }
  }

  async getConsentStatus(userId: string): Promise<Record<string, boolean>> {
    try {
      const consents = await prisma.userConsent.findMany({
        where: { userId },
      });

      return consents.reduce((acc, consent) => {
        acc[consent.consentType] = consent.granted;
        return acc;
      }, {} as Record<string, boolean>);
    } catch (error) {
      throw new ServiceError('Failed to get consent status', 'CONSENT_STATUS_FAILED', 500);
    }
  }

  private sanitizeUserData(user: any) {
    // Remove sensitive fields
    const { stripeCustomerId, ...sanitized } = user;
    return sanitized;
  }

  private sanitizePromptData(prompt: any) {
    return {
      id: prompt.id,
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
      isPublic: prompt.isPublic,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    };
  }

  private sanitizeCommentData(comment: any) {
    return {
      id: comment.id,
      content: comment.content,
      promptId: comment.promptId,
      createdAt: comment.createdAt,
    };
  }

  private sanitizeVoteData(vote: any) {
    return {
      id: vote.id,
      value: vote.value,
      promptId: vote.promptId,
      createdAt: vote.createdAt,
    };
  }

  private sanitizeSubscriptionData(subscription: any) {
    return {
      id: subscription.id,
      planType: subscription.planType,
      status: subscription.status,
      createdAt: subscription.createdAt,
    };
  }

  private sanitizeAuditData(audit: any) {
    return {
      id: audit.id,
      action: audit.action,
      resource: audit.resource,
      timestamp: audit.timestamp,
    };
  }
}
