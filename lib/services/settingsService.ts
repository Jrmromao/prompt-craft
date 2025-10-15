import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ServiceError } from './types';
import { AuditService } from './auditService';
import { AuditAction } from '@/app/constants/audit';

// Validation schemas
export const emailPreferencesSchema = z.object({
  marketingEmails: z.boolean(),
  productUpdates: z.boolean(),
  securityAlerts: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  browserNotifications: z.boolean(),
});

export const themeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

export const apiKeySchema = z.object({
  name: z.string().min(1).max(50),
  expiresAt: z.date().optional(),
});

// Types
export type EmailPreferences = z.infer<typeof emailPreferencesSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;

export class SettingsService {
  private static instance: SettingsService;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private settingsCache: Map<string, { settings: any; timestamp: number }> = new Map();

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get user settings by Clerk ID
   */
  public async getUserSettings(clerkId: string) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    // Check cache first
    const cached = this.settingsCache.get(clerkId);
    const now = Date.now();
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.settings;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        emailPreferences: true,
        notificationSettings: true,
        themeSettings: true,
        apiKeys: {
          select: {
            id: true,
            name: true,
            hashedKey: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    // Parse JSON fields with default values if they're null
    const defaultEmailPreferences = {
      marketingEmails: true,
      productUpdates: true,
      securityAlerts: true,
    };

    const defaultNotificationSettings = {
      emailNotifications: true,
      pushNotifications: true,
      browserNotifications: true,
    };

    const defaultThemeSettings = {
      theme: 'system',
    };

    const settings = {
      emailPreferences: user.emailPreferences
        ? typeof user.emailPreferences === 'string'
          ? JSON.parse(user.emailPreferences)
          : user.emailPreferences
        : defaultEmailPreferences,
      notificationSettings: user.notificationSettings
        ? typeof user.notificationSettings === 'string'
          ? JSON.parse(user.notificationSettings)
          : user.notificationSettings
        : defaultNotificationSettings,
      themeSettings: user.themeSettings
        ? typeof user.themeSettings === 'string'
          ? JSON.parse(user.themeSettings)
          : user.themeSettings
        : defaultThemeSettings,
      apiKeys: user.ApiKey,
    };

    // Update cache
    this.settingsCache.set(clerkId, { settings, timestamp: now });

    return settings;
  }

  /**
   * Update email preferences
   */
  public async updateEmailPreferences(clerkId: string, preferences: EmailPreferences) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    const validatedData = emailPreferencesSchema.parse(preferences);

    const result = await prisma.user.update({
      where: { clerkId },
      data: {
        emailPreferences: {
          set: validatedData,
        },
      },
    });

    // Clear cache
    this.settingsCache.delete(clerkId);

    // Log the update
    await AuditService.getInstance().logAudit({
      userId: result.id,
      action: AuditAction.USER_UPDATE_SETTINGS,
      resource: 'email_preferences',
      details: { updatedFields: Object.keys(validatedData) },
    });

    return result;
  }

  /**
   * Update notification settings
   */
  public async updateNotificationSettings(clerkId: string, settings: NotificationSettings) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    const validatedData = notificationSettingsSchema.parse(settings);

    const result = await prisma.user.update({
      where: { clerkId },
      data: {
        notificationSettings: {
          set: validatedData,
        },
      },
    });

    // Clear cache
    this.settingsCache.delete(clerkId);

    // Log the update
    await AuditService.getInstance().logAudit({
      userId: result.id,
      action: AuditAction.USER_UPDATE_SETTINGS,
      resource: 'notification_settings',
      details: { updatedFields: Object.keys(validatedData) },
    });

    return result;
  }

  /**
   * Update theme settings
   */
  public async updateThemeSettings(clerkId: string, settings: ThemeSettings) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    const validatedData = themeSettingsSchema.parse(settings);

    const result = await prisma.user.update({
      where: { clerkId },
      data: {
        themeSettings: {
          set: validatedData,
        },
      },
    });

    // Clear cache
    this.settingsCache.delete(clerkId);

    // If we're in a browser environment, update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', validatedData.theme);
    }

    // Log the update
    await AuditService.getInstance().logAudit({
      userId: result.id,
      action: AuditAction.USER_UPDATE_SETTINGS,
      resource: 'theme_settings',
      details: { updatedFields: Object.keys(validatedData) },
    });

    return result;
  }

  /**
   * Generate new API key
   */
  public async generateApiKey(clerkId: string, keyData: ApiKey) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    const validatedData = apiKeySchema.parse(keyData);
    const apiKey = `pk_${Math.random().toString(36).substring(2)}_${Date.now()}`;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const result = await prisma.apiKey.create({
      data: {
        lastRotatedAt: new Date(),
        userId: user.id,
        name: validatedData.name,
        hashedKey: apiKey,
        expiresAt: validatedData.expiresAt,
      },
    });

    // Log the API key generation
    await AuditService.getInstance().logAudit({
      userId: user.id,
      action: AuditAction.API_KEY_CREATED,
      resource: 'api_key',
      details: { keyName: validatedData.name },
    });

    return result;
  }

  /**
   * Revoke API key
   */
  public async revokeApiKey(clerkId: string, keyId: string) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new ServiceError('User not found', 'USER_NOT_FOUND');
    }

    const result = await prisma.apiKey.delete({
      where: {
        id: keyId,
        userId: user.id,
      },
    });

    // Log the API key revocation
    await AuditService.getInstance().logAudit({
      userId: user.id,
      action: AuditAction.API_KEY_REVOKED,
      resource: 'api_key',
      details: { keyId },
    });

    return result;
  }

  /**
   * Get active sessions
   */
  public async getActiveSessions(clerkId: string) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    // This would typically integrate with Clerk's session management
    // For now, we'll return a mock implementation
    return [];
  }

  /**
   * Revoke session
   */
  public async revokeSession(clerkId: string, sessionId: string) {
    if (!clerkId) {
      throw new ServiceError('Clerk ID is required', 'INVALID_INPUT');
    }

    // This would typically integrate with Clerk's session management
    // For now, we'll return a mock implementation
    return true;
  }
} 