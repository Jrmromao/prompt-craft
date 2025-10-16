import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CacheService } from '@/lib/services/cacheService';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const stats = await CacheService.getStats(days);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { hits: 0, misses: 0, hitRate: 0, savedCost: 0 },
      { status: 500 }
    );
  }
}
