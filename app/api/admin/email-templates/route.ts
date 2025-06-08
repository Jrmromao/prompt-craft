import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  type: z.enum([
    'TICKET_CREATED',
    'TICKET_ASSIGNED',
    'TICKET_IN_PROGRESS',
    'TICKET_RESOLVED',
    'TICKET_CLOSED',
    'WELCOME_EMAIL',
    'SECURITY_ALERT',
  ]),
  isActive: z.boolean(),
  variables: z.array(z.string()),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true },
        },
        updatedBy: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = templateSchema.parse(body);

    const template = await prisma.emailTemplate.create({
      data: {
        ...validatedData,
        createdById: user.id,
        updatedById: user.id,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating email template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
