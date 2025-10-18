import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/middleware/apiRateLimit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, 'default');
  if (rateLimitResponse) return rateLimitResponse;

  // Your API logic here
  return NextResponse.json({ message: 'Success' });
}
