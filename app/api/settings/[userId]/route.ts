import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SettingsService } from '@/lib/services/settingsService';
import { z } from 'zod';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { getDatabaseIdFromClerk } from '@/lib/utils/auth';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.boolean().optional(),
  language: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await auth();    
    if (!userId || userId !== params.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let settings = await SettingsService.getInstance().getUserSettings(userId);
    
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== params.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Update settings based on validated data
    if (validatedData.theme) {
      await SettingsService.getInstance().updateThemeSettings(userId, { theme: validatedData.theme });
    }
    if (validatedData.notifications !== undefined) {
      await SettingsService.getInstance().updateNotificationSettings(userId, {
        emailNotifications: validatedData.notifications,
        pushNotifications: validatedData.notifications,
        browserNotifications: validatedData.notifications,
      });
    }

    // Get updated settings
    const updatedSettings = await SettingsService.getInstance().getUserSettings(userId);

    const { userDatabaseId, error } = await getDatabaseIdFromClerk(userId);
    if (error) {
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
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 