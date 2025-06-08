import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      // Create view record
      await tx.promptView.create({
        data: {
          promptId: params.promptId,
          userId,
        },
      });

      // Update prompt view count
      await tx.prompt.update({
        where: { id: params.promptId },
        data: {
          viewCount: {
            increment: 1,
          },
          lastViewedAt: new Date(),
        },
      });
    });

    return new NextResponse('View tracked', { status: 200 });
  } catch (error) {
    console.error('Error tracking view:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 