import { prisma } from '@/lib/prisma';
import { UserSettings } from '@prisma/client';

export class SettingsService {
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    return prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  static async createDefaultSettings(userId: string): Promise<UserSettings> {
    return prisma.userSettings.create({
      data: {
        userId,
        theme: 'system',
        notifications: true,
        language: 'en',
      },
    });
  }

  static async updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    return prisma.userSettings.update({
      where: { userId },
      data,
    });
  }
} 