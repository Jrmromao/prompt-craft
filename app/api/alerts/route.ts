import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const alerts = await prisma.alertSettings.findUnique({
      where: { userId: user.id },
    });

    console.log('[Alerts API] Fetched settings:', alerts ? JSON.stringify(alerts.settings) : 'null');

    const defaultSettings = {
      costSpike: { enabled: false, threshold: 50 },
      errorRate: { enabled: false, threshold: 10 },
      slowResponse: { enabled: false, threshold: 2000 },
      invalidApiKey: { enabled: true },
    };

    return NextResponse.json(alerts?.settings || defaultSettings);
  } catch (error) {
    console.error('[Alerts API] Error fetching alerts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const settings = await req.json();
    console.log('[Alerts API] Saving settings:', JSON.stringify(settings, null, 2));

    const alertSettings = await prisma.alertSettings.upsert({
      where: { userId: user.id },
      create: {
        id: crypto.randomUUID(),
        userId: user.id,
        settings: settings,
        updatedAt: new Date(),
      },
      update: {
        settings: settings,
        updatedAt: new Date(),
      },
    });

    console.log('[Alerts API] Saved successfully:', alertSettings.id);
    return NextResponse.json(alertSettings);
  } catch (error) {
    console.error('[Alerts API] Error saving alerts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
