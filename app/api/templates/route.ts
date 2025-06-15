import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

const templateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['zero-shot', 'few-shot', 'chain-of-thought']).optional(),
  complexity: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  example: z.string().optional(),
  bestPractices: z.array(z.string()).optional(),
  successMetrics: z.object({
    clarity: z.number().min(0).max(100),
    specificity: z.number().min(0).max(100),
    effectiveness: z.number().min(0).max(100)
  }).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const complexity = searchParams.get('complexity');
    const search = searchParams.get('search');
    const isPublicParam = searchParams.get('isPublic');
    const isPublic = isPublicParam === null ? undefined : isPublicParam === 'true';

    console.log('API: Fetching templates with filters:', { type, complexity, search, isPublic });

    // First, let's check if we can connect to the database
    try {
      const count = await prisma.promptTemplate.count();
      console.log('API: Total templates in database:', count);
    } catch (dbError) {
      console.error('API: Database connection error:', dbError);
      throw new Error('Database connection failed');
    }

    const templates = await prisma.promptTemplate.findMany({
      where: {
        ...(type && { type }),
        ...(complexity && { complexity }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(isPublic !== undefined && { isPublic })
      },
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' }
      ],
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('API: Found templates:', templates.length);
    if (templates.length === 0) {
      console.log('API: No templates found with current filters');
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('API: Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    // Check for required fields
    if (!body.name || !body.description || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, and content are required' },
        { status: 400 }
      );
    }

    const validatedData = templateSchema.parse(body);

    // If user is authenticated, associate the template with them
    let userId = undefined;
    if (session?.userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: session.userId },
        select: { id: true }
      });
      if (user) {
        userId = user.id;
      }
    }

    const template = await prisma.promptTemplate.create({
      data: {
        ...validatedData,
        userId
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
