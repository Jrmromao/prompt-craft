import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Add required exports for Next.js 15.3.3
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { result, tokenCount } = body;

    await prisma.$transaction(async (tx) => {
      // Create usage record
      await tx.promptUsage.create({
        data: {
          promptId: context.params.id,
          userId,
          result,
          tokenCount: tokenCount || 0
        },
      });

      // Update prompt usage count
      await tx.prompt.update({
        where: { id: context.params.id },
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