import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: List API keys
export async function GET() {
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

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Return masked keys
    const maskedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      key: `pc_${'*'.repeat(60)}`,
      createdAt: key.createdAt,
      lastUsed: null,
    }));

    return NextResponse.json({ keys: maskedKeys });
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST: Create new API key
export async function POST(request: Request) {
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

    const { name } = await request.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: 'Name must be at least 3 characters' }, { status: 400 });
    }

    // Generate cryptographically secure API key
    const apiKey = `pc_${randomBytes(32).toString('hex')}`;
    
    // SOC 2: Hash with bcrypt
    const hashedKey = await bcrypt.hash(apiKey, 10);

    const newKey = await prisma.apiKey.create({
      data: {
        id: randomBytes(16).toString('hex'),
        userId: user.id,
        name: name.trim(),
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
        details: {
          keyId: newKey.id,
          keyName: newKey.name,
          message: `Created API key: ${newKey.name}`,
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      key: {
        id: newKey.id,
        name: newKey.name,
        key: apiKey, // Full key shown only once!
        createdAt: newKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to create API key:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ 
      error: 'Failed to create API key',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Delete API key
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    // Verify the key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    // SOC 2: Audit log
    await prisma.auditLog.create({
      data: {
        id: randomBytes(16).toString('hex'),
        userId: user.id,
        action: 'API_KEY_DELETED',
        resource: 'ApiKey',
        details: {
          keyId,
          keyName: apiKey.name,
          message: `Deleted API key: ${apiKey.name}`,
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete API key:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}
