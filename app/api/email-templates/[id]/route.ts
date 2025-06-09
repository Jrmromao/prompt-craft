import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  type: z.string().min(1),
  variables: z.array(z.string()),
});

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request: Request, context: any) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the database user ID from the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const body = await request.json();
    const validatedData = templateSchema.parse(body);

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        id: context.params.id,
        createdById: user.id,
      },
    });

    if (!existingTemplate) {
      return new NextResponse('Template not found', { status: 404 });
    }

    const template = await prisma.emailTemplate.update({
      where: {
        id: context.params.id,
      },
      data: {
        name: validatedData.name,
        subject: validatedData.subject,
        body: validatedData.body,
        type: validatedData.type,
        variables: validatedData.variables,
        updatedById: user.id,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    console.error('[EMAIL_TEMPLATES_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the database user ID from the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        id: context.params.id,
        createdById: user.id,
      },
    });

    if (!existingTemplate) {
      return new NextResponse('Template not found', { status: 404 });
    }

    await prisma.emailTemplate.delete({
      where: {
        id: context.params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[EMAIL_TEMPLATES_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
