import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIService } from '@/lib/services/aiService';
import { rateLimiter } from '@/lib/utils/rateLimit';
import { securityHeaders } from '@/app/api/config';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define the handler
async function runHandler(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: securityHeaders }
      );
    }

    // Rate limiting per user
    const { success, limit, reset, remaining } = await rateLimiter.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { promptId, input, model, temperature } = body;

    if (!promptId || !input) {
      return NextResponse.json(
        { error: 'Prompt ID and input are required' },
        { status: 400, headers: securityHeaders }
      );
    }

    const aiService = AIService.getInstance();
    const result = await aiService.runPrompt({
      promptId,
      input,
      model: model || 'gpt-4',
      temperature: temperature || 0.7,
      userId,
    });

    // Create response with security headers
    const response = NextResponse.json(result);

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add cache headers for similar inputs
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Vary', 'Authorization, X-Requested-With');

    return response;
  } catch (error) {
    console.error('Error running prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders,
        },
      }
    );
  }
}

// Export the handler
export const POST = runHandler;
