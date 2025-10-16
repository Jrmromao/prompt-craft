import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { consentType, granted } = await req.json();

    const consent = await prisma.consentRecord.create({
      data: {
        userId: user.id,
        purpose: consentType,
        granted,
      } as any,
    });

    return NextResponse.json(consent);
  } catch (error) {
    console.error('Error recording consent:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const consents = await prisma.consentRecord.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(consents);
  } catch (error) {
    console.error('Error fetching consents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
