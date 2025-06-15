import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching templates...');
    const templates = await prisma.promptTemplate.findMany({
      select: {
        tags: true,
      },
    });

    console.log('Found templates:', templates);

    // Count occurrences of each tag
    const tagCounts = templates.reduce((acc, template) => {
      template.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format
    const formattedCategories = Object.entries(tagCounts).map(([tag, count]) => ({
      value: tag,
      count,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error },
      { status: 500 }
    );
  }
} 