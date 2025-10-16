import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CacheService } from '@/lib/services/cacheService';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!CacheService.isEnabled()) {
      return NextResponse.json({ hit: false });
    }

    const { provider, model, messages } = await request.json();

    const cached = await CacheService.get(provider, model, messages);

    if (cached) {
      return NextResponse.json({
        hit: true,
        response: cached.response,
        savedCost: cached.cost,
        cachedAt: cached.timestamp,
      });
    }

    // Track miss
    await CacheService.trackHit(false);

    return NextResponse.json({ hit: false });
  } catch (error) {
    console.error('Cache get error:', error);
    return NextResponse.json({ hit: false });
  }
}
