import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { versionId, ratingId, testInput, testOutput, tokensUsed, duration } = body;

    if (!versionId || !testInput || !testOutput) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const testHistory = await prisma.promptTestHistory.create({
      data: {
        promptId: params.id,
        userId,
        versionId,
        ratingId,
        testInput,
        testOutput,
        tokensUsed: tokensUsed || 0,
        duration: duration || 0,
      },
      include: {
        rating: true,
      },
    });

    return NextResponse.json(testHistory);
  } catch (error) {
    console.error('Error saving test history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get('versionId');

    const testHistory = await prisma.promptTestHistory.findMany({
      where: {
        promptId: params.id,
        userId,
        ...(versionId ? { versionId } : {}),
      },
      include: {
        rating: true,
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