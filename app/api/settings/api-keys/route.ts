import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateApiKey, rotateApiKey, listApiKeys, deleteApiKey } from '@/utils/api-keys';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { getDatabaseIdFromClerk } from '@/lib/utils/auth';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Schema for creating a new API key
const createApiKeySchema = z.object({
  name: z.string().min(3).max(50),
  expiresIn: z.number().min(1).max(365).optional(), // Days until expiration
  scopes: z.array(z.string()).optional(),
});

// GET: List API keys
export async function GET(request: Request, context: any) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKeys = await listApiKeys(userId);
  return NextResponse.json(apiKeys);
}

// POST: Create a new API key
export async function POST(request: Request, context: any) {
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

    const { userDatabaseId, error } = await getDatabaseIdFromClerk(userId);
    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Audit log for API key creation
    await AuditService.getInstance().logAudit({
      action: AuditAction.API_KEY_CREATED,
      userId: userDatabaseId,
      resource: 'apiKey',
      details: { name: data.name, expiresAt, scopes: data.scopes },
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

    // Audit log for API key deletion
    await AuditService.getInstance().logAudit({
      action: AuditAction.API_KEY_REVOKED,
      userId,
      resource: 'apiKey',
      details: { keyId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
