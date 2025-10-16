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
      return NextResponse.json({ success: false });
    }

    const { provider, model, messages, response, tokens, cost, ttl } = await request.json();

    await CacheService.set(provider, model, messages, response, tokens, cost, ttl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cache set error:', error);
    return NextResponse.json({ success: false });
  }
}
