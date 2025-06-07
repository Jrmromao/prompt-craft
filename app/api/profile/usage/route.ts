import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UsageService } from '@/lib/services/usageService';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const usageService = UsageService.getInstance();
    const usage = await usageService.getUserUsage(userId);

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json({ error: 'Failed to fetch user usage' }, { status: 500 });
  }
}
