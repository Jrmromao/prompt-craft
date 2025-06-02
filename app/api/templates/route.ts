import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const templates = await prisma.promptTemplate.findMany({
      where: {
        isPublic: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('[TEMPLATES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, content, isPublic, tags } = body;

    if (!name || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const template = await prisma.promptTemplate.create({
      data: {
        name,
        description,
        content,
        isPublic: isPublic || false,
        tags: tags || [],
        userId: 'public-user' // Using a default public user ID
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('[TEMPLATES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 