import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';

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

    // Generate API key
    const key = `pc_${randomBytes(32).toString('hex')}`;
    
    // Hash the key for storage
    const hashedKey = createHash('sha256').update(key).digest('hex');

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        id: randomBytes(16).toString('hex'),
        userId: user.id,
        name: 'Default API Key',
        hashedKey,
        lastRotatedAt: new Date(),
        updatedAt: new Date(),
        scopes: ['read', 'write'],
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: key, // Return the plain key (only time user sees it)
      id: apiKey.id,
    });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
