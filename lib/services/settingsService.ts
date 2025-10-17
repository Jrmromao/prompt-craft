import { prisma } from '@/lib/prisma';

export class SettingsService {
  static async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailPreferences: true,
        notificationSettings: true,
        securitySettings: true,
        themeSettings: true,
      },
    });

    return user || {};
  }

  static async updateSettings(userId: string, settings: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: settings,
    });
  }
}
