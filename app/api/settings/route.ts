import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SettingsService } from '@/lib/services/settingsService';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { UserService } from '@/lib/services/userService';

// Export dynamic configuration 
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Get user settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await SettingsService.getInstance().getUserSettings(userId);

    await AuditService.getInstance().logAudit({
      action: AuditAction.USER_GET_SETTINGS,
      userId,
      resource: 'settings',
      status: 'success',
      details: { settings },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const settingsService = SettingsService.getInstance();

    let updatedSettings;
    if (data.emailPreferences) {
      updatedSettings = await settingsService.updateEmailPreferences(userId, data.emailPreferences);
    } else if (data.notificationSettings) {
      updatedSettings = await settingsService.updateNotificationSettings(userId, data.notificationSettings);
    } else if (data.themeSettings) {
      updatedSettings = await settingsService.updateThemeSettings(userId, data.themeSettings);
    } else {
      return NextResponse.json(
        { error: 'Invalid settings update' },
        { status: 400 }
      );
    }

    // get user databaseId from userService 
    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await AuditService.getInstance().logAudit({
      action: AuditAction.USER_UPDATE_SETTINGS,
      userId: userDatabaseId,
      resource: 'settings',
      status: 'success',
      details: { settings: updatedSettings },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
