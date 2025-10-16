import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST() {
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

    // SOC 2: Rate limiting - max 5 keys per user
    const existingKeys = await prisma.apiKey.count({
      where: { userId: user.id },
    });

    if (existingKeys >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 API keys allowed per user' },
        { status: 429 }
      );
    }

    // Generate cryptographically secure API key
    const key = `pc_${randomBytes(32).toString('hex')}`;
    
    // SOC 2: Hash with bcrypt (salt rounds = 10)
    const hashedKey = await bcrypt.hash(key, 10);

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        id: randomBytes(16).toString('hex'),
        userId: user.id,
        name: `API Key ${existingKeys + 1}`,
        hashedKey,
        lastRotatedAt: new Date(),
        updatedAt: new Date(),
        scopes: ['read', 'write'],
      },
    });

    // SOC 2: Audit log
    await prisma.auditLog.create({
      data: {
        id: randomBytes(16).toString('hex'),
        userId: user.id,
        action: 'API_KEY_CREATED',
        resource: 'ApiKey',
        resourceId: apiKey.id,
        metadata: {
          keyId: apiKey.id,
          keyName: apiKey.name,
          ipAddress: 'unknown', // Add IP tracking if needed
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: key, // Return plain key ONLY ONCE
      id: apiKey.id,
      warning: '⚠️ Save this key now. For security, you will not see it again.',
    });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
