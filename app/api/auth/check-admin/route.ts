import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Allow access in development mode
    if (process.env.NODE_ENV === 'development') {
      return new NextResponse('Authorized (Development Mode)', { status: 200 });
    }

    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // First, update the user's role to ADMIN
    await prisma.user.update({
      where: { clerkId: userId },
      data: { role: 'ADMIN' },
    });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    return new NextResponse('Authorized', { status: 200 });
  } catch (error) {
    console.error('Admin check error:', error instanceof Error ? error.message : 'Unknown error');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
