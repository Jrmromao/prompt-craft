import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { rotateApiKey } from '@/utils/api-keys';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function rotateKeyHandler(request: Request) {
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

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(rotateKeyHandler, fallbackData);
