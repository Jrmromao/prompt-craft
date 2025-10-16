import { prisma } from '@/lib/prisma';
import { User, DataExportRequest, DataRectificationRequest } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class GDPRService {

  constructor() {
  }

  async exportUserData(clerkId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        consentHistory: true,
        dataProcessingRecords: true,
        apiKeys: true,
        apiUsage: true,
        auditLogs: true,
        comments: true,
        creditHistory: true,
        featureUsage: true,
        notifications: true,
        playgroundRuns: true,
        prompts: true,
        promptTemplates: true,
        promptGenerations: true,
        votes: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create export request record
    await prisma.dataExportRequest.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        format: 'JSON',
      },
    });

    // Send notification
//     await this.emailService.sendGDPRDataExportNotification(user.email, user.name || 'User');

    // Process and return user data
    return this.formatUserData(user);
  }

  async handleDeletionRequest(clerkId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create deletion request record
    await prisma.user.update({
      where: { clerkId },
      data: {
        dataDeletionRequest: new Date(),
      },
    });

    // Send notification
//     await this.emailService.sendGDPRAccountDeletionNotification(user.email, user.name || 'User');

    // Implement deletion logic
    await this.anonymizeUserData(clerkId);
  }

  async handleRectificationRequest(
    userId: string,
    data: Partial<User>
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create rectification request record
    await prisma.dataRectificationRequest.create({
      data: {
        userId,
        status: 'PENDING',
        changes: data,
      },
    });

    // Get the list of changed fields
    const changes = Object.keys(data).map(field => `${field} updated`);

    // Email notification removed (EmailService deleted)
    // TODO: Re-implement email notifications if needed

    // Implement rectification logic
    await prisma.user.update({
      where: { id: userId },
      data: data as Prisma.UserUpdateInput,
    });
  }

  async recordConsent(
    userId: string,
    purpose: string,
    granted: boolean,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.consentRecord.create({
      data: {
        userId,
        purpose,
        granted,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });

    // Email notification removed (EmailService deleted)
    // TODO: Re-implement email notifications if needed
  }

  async checkAndEnforceRetention(): Promise<void> {
    const expiredUsers = await prisma.user.findMany({
      where: {
        dataRetentionPeriod: {
          lt: new Date(),
        },
      },
    });

    for (const user of expiredUsers) {
      await this.handleExpiredData(user);
    }
  }

  private async anonymizeUserData(clerkId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Implement data anonymization
    await prisma.user.update({
      where: { clerkId },
      data: {
        email: `deleted_${user.id}@deleted.com`,
        name: 'Deleted User',
        bio: null,
        company: null,
        jobTitle: null,
        linkedin: null,
        location: null,
        twitter: null,
        website: null,
        imageUrl: null,
        status: 'BANNED',
      },
    });

    // Delete or anonymize related data
    await Promise.all([
      prisma.apiKey.deleteMany({ where: { userId: user.id } }),
      prisma.comment.deleteMany({ where: { userId: user.id } }),
      prisma.prompt.deleteMany({ where: { userId: user.id } }),
      prisma.promptTemplate.deleteMany({ where: { userId: user.id } }),
      prisma.promptGeneration.deleteMany({ where: { userId: user.id } }),
      prisma.vote.deleteMany({ where: { userId: user.id } }),
    ]);
  }

  private async handleExpiredData(user: User): Promise<void> {
    // Implement data expiration logic
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'SUSPENDED',
        dataRetentionPeriod: null,
      },
    });
  }

  private formatUserData(user: User & {
    apiKeys: any[];
    apiUsage: any[];
    auditLogs: any[];
    comments: any[];
    creditHistory: any[];
    featureUsage: any[];
    notifications: any[];
    playgroundRuns: any[];
    prompts: any[];
    promptTemplates: any[];
    promptGenerations: any[];
    votes: any[];
    consentHistory: any[];
    dataProcessingRecords: any[];
  }): UserDataExport {
    return {
      personalData: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
        status: user.status,
        preferences: {
          email: user.emailPreferences,
          language: user.languagePreferences,
          notifications: user.notificationSettings,
          security: user.securitySettings,
          theme: user.themeSettings,
        },
      },
      activity: {
        apiKeys: user.apiKeys,
        apiUsage: user.apiUsage,
        auditLogs: user.auditLogs,
        comments: user.comments,
        creditHistory: user.creditHistory,
        featureUsage: user.featureUsage,
        notifications: user.notifications,
        playgroundRuns: user.playgroundRuns,
        prompts: user.prompts,
        promptTemplates: user.promptTemplates,
        promptGenerations: user.promptGenerations,
        votes: user.votes,
      },
      consent: {
        history: user.consentHistory,
        processingRecords: user.dataProcessingRecords,
      },
    };
  }
}

interface UserDataExport {
  personalData: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: string;
    status: string;
    preferences: {
      email: any;
      language: any;
      notifications: any;
      security: any;
      theme: any;
    };
  };
  activity: {
    apiKeys: any[];
    apiUsage: any[];
    auditLogs: any[];
    comments: any[];
    creditHistory: any[];
    featureUsage: any[];
    notifications: any[];
    playgroundRuns: any[];
    prompts: any[];
    promptTemplates: any[];
    promptGenerations: any[];
    votes: any[];
  };
  consent: {
    history: any[];
    processingRecords: any[];
  };
} 