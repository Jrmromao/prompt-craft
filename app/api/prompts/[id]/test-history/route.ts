import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Add required exports for Next.js 15.3.3
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { promptVersionId, input, output, tokensUsed, duration } = body;

    if (!promptVersionId || !output) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const testHistory = await prisma.promptTestHistory.create({
      data: {
        promptId: context.params.id,
        userId,
        promptVersionId,
        input,
        output,
        tokensUsed: tokensUsed || 0,
        duration: duration || 0,
        updatedAt: new Date(),
      },
      include: {
        PromptVersion: true,
      },
    });

    return NextResponse.json(testHistory);
  } catch (error) {
    console.error('Error saving test history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const promptVersionId = searchParams.get('promptVersionId');

    const testHistory = await prisma.promptTestHistory.findMany({
      where: {
        promptId: context.params.id,
        userId,
        ...(promptVersionId ? { promptVersionId } : {}),
      },
      include: {
        PromptVersion: {
          include: {
            PromptTest: {
              include: {
                PromptRating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(testHistory);
  } catch (error) {
    console.error('Error fetching test history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 