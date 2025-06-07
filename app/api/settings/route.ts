import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getUserSettings,
  updateEmailPreferences,
  updateNotificationSettings,
  updateThemeSettings,
  generateApiKey,
  revokeApiKey,
} from '@/app/services/settingsService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function settingsHandler() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const settings = await getUserSettings(userId);
  if (!settings) {
    return new NextResponse('Not found', { status: 404 });
  }

  return NextResponse.json(settings);
}

// Define fallback data
const fallbackData = {
  emailPreferences: {
    marketingEmails: true,
    productUpdates: true,
    securityAlerts: true,
  },
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true,
    browserNotifications: true,
  },
  themeSettings: {
    theme: 'system',
    accentColor: 'purple',
  },
  languagePreferences: {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  securitySettings: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
  },
};

// Export the wrapped handler
export const GET = withDynamicRoute(settingsHandler, fallbackData);

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { type, data } = body;

    let result;
    switch (type) {
      case 'email':
        result = await updateEmailPreferences(userId, data);
        break;
      case 'notifications':
        result = await updateNotificationSettings(userId, data);
        break;
      case 'theme':
        result = await updateThemeSettings(userId, data);
        break;
      case 'apiKey':
        result = await generateApiKey(userId, data.name);
        break;
      case 'revokeApiKey':
        result = await revokeApiKey(userId, data.key);
        break;
      default:
        return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 });
  }
}
