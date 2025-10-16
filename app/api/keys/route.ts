import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        expiresAt: true,
        scopes: true,
      },
    });

    return NextResponse.json(keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
