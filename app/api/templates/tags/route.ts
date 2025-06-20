import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    console.log('Fetching popular tags...');
    console.log('Limit:', limit);

    const templates = await prisma.promptTemplate.findMany({
      select: {
        tags: true,
      },
    });

    console.log('Found templates:', templates.length);

    // Count occurrences of each tag
    const tagCounts = templates.reduce((acc, template) => {
      template.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    console.log('Tag counts:', tagCounts);

    // Sort tags by count and take top N
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    console.log('Popular tags:', popularTags);

    return NextResponse.json(popularTags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular tags', details: error },
      { status: 500 }
    );
  }
} 