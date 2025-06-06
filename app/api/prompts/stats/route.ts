import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get prompt statistics
    const [totalPrompts, privatePrompts] = await Promise.all([
      prisma.prompt.count({
        where: { userId: dbUser.id },
      }),
      prisma.prompt.count({
        where: {
          userId: dbUser.id,
          isPublic: false,
        },
      }),
    ]);

    return NextResponse.json({
      totalPromptCount: totalPrompts,
      privatePromptCount: privatePrompts,
      publicPromptCount: totalPrompts - privatePrompts,
    });
  } catch (error) {
    console.error('Error fetching prompt stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
