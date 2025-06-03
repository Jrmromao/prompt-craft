import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@/utils/constants';

// Define prompt limits per plan
const PROMPT_LIMITS = {
  [Role.FREE]: 10,
  [Role.LITE]: 250,
  [Role.PRO]: Infinity,
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ canCreate: false, isLastFree: false, redirectTo: '/sign-in' }, { status: 401 });
    }

    // Get user and their role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ canCreate: false, isLastFree: false, redirectTo: '/sign-up' }, { status: 404 });
    }

    const role = user.role || Role.FREE;
    const promptLimit = PROMPT_LIMITS[role] ?? 0;

    // Pro users are unlimited
    if (promptLimit === Infinity) {
      return NextResponse.json({ canCreate: true, isLastFree: false, redirectTo: null });
    }

    // Count prompts created by the user
    const promptCount = await prisma.prompt.count({ where: { userId: user.id } });

    // Check if user can create more prompts
    const canCreate = promptCount < promptLimit;
    const isLastFree = promptCount === promptLimit - 1;
    const redirectTo = canCreate ? null : '/pricing';

    return NextResponse.json({ canCreate, isLastFree, redirectTo });
  } catch (error) {
    console.error('Error in /api/subscription/check:', error);
    return NextResponse.json({ canCreate: false, isLastFree: false, redirectTo: '/pricing' }, { status: 500 });
  }
} 