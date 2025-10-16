import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

    const { name, scopes } = await req.json();

    // Generate API key
    const key = `pc_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        name: name || 'API Key',
        hashedKey,
        scopes: scopes || [],
        lastRotatedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ key, id: apiKey.id });
  } catch (error) {
    console.error('Error generating API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
