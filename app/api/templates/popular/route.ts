import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    console.log('Fetching popular templates with limit:', limit);

    const templates = await prisma.promptTemplate.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        content: true,
        type: true,
        complexity: true,
        example: true,
        bestPractices: true,
        successMetrics: true,
        usageCount: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        tags: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' }
      ],
      take: limit
    });

    console.log('Found templates:', templates.length);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular templates' },
      { status: 500 }
    );
  }
} 