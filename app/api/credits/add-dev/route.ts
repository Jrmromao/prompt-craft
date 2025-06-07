import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Configure route as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ⚠️ DEVELOPMENT ONLY: This endpoint should be removed before going to production
// This is a temporary solution for development and testing purposes only
export async function POST(req: Request) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not available in production', { status: 403 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    // Update user's credit balance
    const updatedUser = await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        credits: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.credits,
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
