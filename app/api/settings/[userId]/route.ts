import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SettingsService } from '@/lib/services/settingsService';
import { z } from 'zod';

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

    let settings = await SettingsService.getUserSettings(userId);
    
    if (!settings) {
      settings = await SettingsService.createDefaultSettings(userId);
    }

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

    let settings = await SettingsService.getUserSettings(userId);
    
    if (!settings) {
      settings = await SettingsService.createDefaultSettings(userId);
    }

    const updatedSettings = await SettingsService.updateUserSettings(userId, validatedData);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 