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

    const body = await request.json();
    const { result } = body;

    await prisma.$transaction(async (tx) => {
      // Create usage record
      await tx.promptUsage.create({
        data: {
          promptId: params.promptId,
          userId,
          result,
        },
      });

      // Update prompt usage count
      await tx.prompt.update({
        where: { id: params.promptId },
        data: {
          usageCount: {
            increment: 1,
          },
          lastUsedAt: new Date(),
        },
      });
    });

    return new NextResponse('Usage tracked', { status: 200 });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 