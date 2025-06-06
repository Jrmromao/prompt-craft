import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

/**
 * Get user settings by Clerk ID
 */
export async function getUserSettings(clerkId: string) {
  if (!clerkId) throw new Error('Clerk ID is required');

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

  if (!user) return null;

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

  return {
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
    apiKeys: user.apiKeys,
  };
}

/**
 * Update email preferences
 */
export async function updateEmailPreferences(clerkId: string, preferences: EmailPreferences) {
  const validatedData = emailPreferencesSchema.parse(preferences);

  return prisma.user.update({
    where: { clerkId },
    data: { emailPreferences: validatedData },
  });
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(clerkId: string, settings: NotificationSettings) {
  const validatedData = notificationSettingsSchema.parse(settings);

  return prisma.user.update({
    where: { clerkId },
    data: { notificationSettings: validatedData },
  });
}

/**
 * Update theme settings
 */
export async function updateThemeSettings(clerkId: string, settings: ThemeSettings) {
  const validatedData = themeSettingsSchema.parse(settings);

  // Update both database and localStorage
  const result = await prisma.user.update({
    where: { clerkId },
    data: { themeSettings: validatedData },
  });

  // If we're in a browser environment, update localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', validatedData.theme);
  }

  return result;
}

/**
 * Generate new API key
 */
export async function generateApiKey(clerkId: string, keyData: ApiKey) {
  const validatedData = apiKeySchema.parse(keyData);
  const apiKey = `pk_${Math.random().toString(36).substring(2)}_${Date.now()}`;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) throw new Error('User not found');

  return prisma.apiKey.create({
    data: {
      lastRotatedAt: new Date(),
      userId: user.id,
      name: validatedData.name,
      hashedKey: apiKey,
      expiresAt: validatedData.expiresAt,
    },
  });
}

/**
 * Revoke API key
 */
export async function revokeApiKey(clerkId: string, keyId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) throw new Error('User not found');

  return prisma.apiKey.delete({
    where: {
      id: keyId,
      userId: user.id,
    },
  });
}

/**
 * Get active sessions
 */
export async function getActiveSessions(clerkId: string) {
  // This would typically integrate with Clerk's session management
  // For now, we'll return a mock implementation
  return [];
}

/**
 * Revoke session
 */
export async function revokeSession(clerkId: string, sessionId: string) {
  // This would typically integrate with Clerk's session management
  // For now, we'll return a mock implementation
  return true;
}
