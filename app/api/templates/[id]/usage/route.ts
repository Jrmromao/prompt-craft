import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.promptTemplate.update({
      where: { id: params.id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment template usage' },
      { status: 500 }
    );
  }
} 