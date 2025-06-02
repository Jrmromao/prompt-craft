import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const template = await prisma.template.findFirst({
      where: {
        id: params.templateId,
        isPublic: true
      }
    });

    if (!template) {
      return new NextResponse('Template not found', { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('[TEMPLATE_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const body = await req.json();
    const { name, description, content, isPublic, tags } = body;

    if (!name || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const template = await prisma.template.findFirst({
      where: {
        id: params.templateId,
        userId: 'public-user'
      }
    });

    if (!template) {
      return new NextResponse('Template not found', { status: 404 });
    }

    const updatedTemplate = await prisma.template.update({
      where: {
        id: params.templateId
      },
      data: {
        name,
        description,
        content,
        isPublic: isPublic || false,
        tags: tags || []
      }
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('[TEMPLATE_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const template = await prisma.template.findFirst({
      where: {
        id: params.templateId,
        userId: 'public-user'
      }
    });

    if (!template) {
      return new NextResponse('Template not found', { status: 404 });
    }

    await prisma.template.delete({
      where: {
        id: params.templateId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TEMPLATE_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 