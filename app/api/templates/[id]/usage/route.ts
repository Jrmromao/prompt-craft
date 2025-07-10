import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, context: any) {

  try {
    const params = await context.params;
    const templateId = params.id;
    
    const template = await prisma.promptTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template usage:', error);
    return NextResponse.json(
      { error: 'Failed to update template usage' },
      { status: 500 }
    );
  }
} 