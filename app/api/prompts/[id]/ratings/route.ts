import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Route configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clarity, specificity, context: contextScore, overall, feedback } = await request.json();

    // Validate required fields
    if (!clarity || !specificity || !contextScore || !overall || !feedback) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate score ranges
    const scores = [clarity, specificity, contextScore, overall];
    if (scores.some(score => score < 1 || score > 10)) {
      return NextResponse.json({ error: 'Scores must be between 1 and 10' }, { status: 400 });
    }

    const params = await context.params;
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
        context: contextScore,
        overall,
        feedback,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        promptId: params.id,
        clarity,
        specificity,
        context: contextScore,
        overall,
        feedback,
      },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error saving prompt rating:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
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
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 