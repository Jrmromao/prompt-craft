// app/api/test/route.ts
import { NextResponse } from 'next/server';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Test endpoint
export async function GET(request: Request, context: any) {
  return NextResponse.json({ message: 'API is working' });
}
