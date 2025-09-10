import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { AIService } from '@/lib/services/aiService';
import { rateLimiter } from '@/lib/utils/rateLimit';
import { securityHeaders } from '@/app/api/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    // Rate limiting per user
    const { success, limit, reset, remaining } = await rateLimiter.limit(authResult.user.clerkId);
    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded'
      }, {
        status: 429,
        headers: {
          ...securityHeaders,
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }

    const body = await request.json();
    const { promptId, input, model, temperature } = body;

    if (!promptId || !input) {
      return NextResponse.json({
        success: false,
        error: 'Prompt ID and input are required'
      }, { status: 400, headers: securityHeaders });
    }

    const aiService = AIService.getInstance();
    const result = await aiService.runPrompt({
      promptId,
      input,
      model: model || 'deepseek',
      temperature: temperature || 0.7,
      userId: authResult.user.clerkId,
    });

    const response = NextResponse.json({
      success: true,
      data: result
    });

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Vary', 'Authorization, X-Requested-With');

    return response;
  } catch (error) {
    console.error('Error running prompt:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message === 'Insufficient credits') {
        errorMessage = 'Insufficient credits';
        statusCode = 400;
      } else if (error.message === 'Model access denied for current plan') {
        errorMessage = 'Model access denied for current plan';
        statusCode = 403;
      } else if (error.message === 'Prompt not found') {
        errorMessage = 'Prompt not found';
        statusCode = 404;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, {
      status: statusCode,
      headers: securityHeaders,
    });
  }
}
