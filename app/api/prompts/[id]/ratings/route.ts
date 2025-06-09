import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { clarity, specificity, context, overall, feedback } = await req.json();

    // Validate required fields
    if (!clarity || !specificity || !context || !overall || !feedback) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate score ranges
    const scores = [clarity, specificity, context, overall];
    if (scores.some(score => score < 1 || score > 10)) {
      return new NextResponse('Scores must be between 1 and 10', { status: 400 });
    }

    // Upsert the rating (create or update)
    const rating = await prisma.promptRating.upsert({
      where: {
        userId_promptId: {
          userId: session.userId,
          promptId: params.id,
        },
      },
      update: {
        clarity,
        specificity,
        context,
        overall,
        feedback,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        promptId: params.id,
        clarity,
        specificity,
        context,
        overall,
        feedback,
      },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error saving prompt rating:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const rating = await prisma.promptRating.findUnique({
      where: {
        userId_promptId: {
          userId: session.userId,
          promptId: params.id,
        },
      },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error fetching prompt rating:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 