import { NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/templateService';
import { prisma } from '@/lib/prisma';

const templateService = new TemplateService();

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const template = await prisma.promptTemplate.findUnique({
      where: { id: context.params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rating } = await request.json();
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating value' },
        { status: 400 }
      );
    }

    const template = await templateService.updateRating(params.id, rating);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template rating:', error);
    return NextResponse.json(
      { error: 'Failed to update template rating' },
      { status: 500 }
    );
  }
} 