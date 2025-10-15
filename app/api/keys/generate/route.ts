import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

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

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        userId: user.id,
        name: 'Default API Key',
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: key,
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
