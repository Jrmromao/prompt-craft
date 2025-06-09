import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { rotateApiKey } from '@/utils/api-keys';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST: Rotate API key
export async function POST(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return new NextResponse('Key ID is required', { status: 400 });
    }

    const rotatedKey = await rotateApiKey(userId, keyId);
    return NextResponse.json(rotatedKey);
  } catch (error) {
    console.error('Error rotating API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
