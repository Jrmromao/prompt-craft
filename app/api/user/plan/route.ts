import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/lib/services/userService';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userDatabaseId },
      select: { planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ planType: user.planType });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user plan' },
      { status: 500 }
    );
  }
} 