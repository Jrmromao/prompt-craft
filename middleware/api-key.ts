import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey } from '@/utils/api-keys';

export async function apiKeyMiddleware(request: NextRequest) {
  // Get API key from header
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return new NextResponse(JSON.stringify({
      error: 'Missing API Key',
      message: 'Please provide an API key in the x-api-key header',
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Validate the API key
  const validation = await validateApiKey(apiKey);
  
  if (!validation) {
    return new NextResponse(JSON.stringify({
      error: 'Invalid API Key',
      message: 'The provided API key is invalid or has expired',
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Add user info to request headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', validation.userId);
  requestHeaders.set('x-user-role', validation.role);
  if (validation.scopes.length > 0) {
    requestHeaders.set('x-user-scopes', validation.scopes.join(','));
  }

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
} 