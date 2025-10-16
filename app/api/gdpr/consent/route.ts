import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    const body = await request.json();
    const { consentType, granted, preferences } = body;

    // Track anonymous consent (before login)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (clerkUserId) {
      // Logged in user - store in database
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      });

      if (user) {
        await prisma.userConsent.upsert({
          where: {
            userId_consentType: {
              userId: user.id,
              consentType,
            },
          },
          create: {
            id: `consent_${Date.now()}`,
            userId: user.id,
            consentType,
            granted,
            grantedAt: new Date(),
          },
          update: {
            granted,
            grantedAt: new Date(),
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: granted ? 'CONSENT_GRANTED' : 'CONSENT_WITHDRAWN',
            resource: 'consent',
            details: {
              consentType,
              preferences,
              ipAddress,
              userAgent,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Consent tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const consents = await prisma.userConsent.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ consents });
  } catch (error) {
    console.error('Consent fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 });
  }
}
