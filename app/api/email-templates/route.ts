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

export async function POST(req: Request) {
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

    const body = await req.json();
    const validatedData = templateSchema.parse(body);

    const template = await prisma.emailTemplate.create({
      data: {
        name: validatedData.name,
        subject: validatedData.subject,
        body: validatedData.body,
        type: validatedData.type,
        variables: validatedData.variables,
        createdById: user.id,
        updatedById: user.id,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    console.error('[EMAIL_TEMPLATES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: Request) {
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

    const templates = await prisma.emailTemplate.findMany({
      where: {
        createdById: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('[EMAIL_TEMPLATES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
