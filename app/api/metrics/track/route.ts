import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, tokenCount, metadata } = body;

    if (!type || !tokenCount) {
      return NextResponse.json(
        { error: 'Type and tokenCount are required' },
        { status: 400 }
      );
    }

    await prisma.usageMetrics.create({
      data: {
        userId,
        type,
        tokenCount,
        metadata,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking metrics:', error);
    return NextResponse.json(
      { error: 'Failed to track metrics' },
      { status: 500 }
    );
  }
} 