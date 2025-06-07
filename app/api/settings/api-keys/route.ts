import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateApiKey, rotateApiKey, listApiKeys, deleteApiKey } from '@/utils/api-keys';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Schema for creating a new API key
const createApiKeySchema = z.object({
  name: z.string().min(3).max(50),
  expiresIn: z.number().min(1).max(365).optional(), // Days until expiration
  scopes: z.array(z.string()).optional(),
});

// Define the main handler
async function apiKeysHandler(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKeys = await listApiKeys(userId);
  return NextResponse.json(apiKeys);
}

// Define the POST handler
async function createApiKeyHandler(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createApiKeySchema.parse(body);

    // Calculate expiration date if provided
    const expiresAt = data.expiresIn
      ? new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000)
      : undefined;

    const apiKey = await generateApiKey(userId, {
      name: data.name,
      expiresAt,
      scopes: data.scopes,
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handlers
export const GET = withDynamicRoute(apiKeysHandler, fallbackData);
export const POST = withDynamicRoute(createApiKeyHandler, fallbackData);

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return new NextResponse('Missing key ID', { status: 400 });
    }

    await deleteApiKey(userId, keyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
