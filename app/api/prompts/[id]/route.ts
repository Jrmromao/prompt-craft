import { NextRequest, NextResponse } from 'next/server';
// import { dynamic, runtime, securityHeaders, cacheConfig } from '@/app/api/config';
import { securityHeaders, cacheConfig } from '@/app/api/config';
import { PromptService } from '@/lib/services/promptService';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/utils/rateLimit';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cache control headers
const getCacheControl = (duration: number) => {
  return `public, s-maxage=${duration}, stale-while-revalidate=${duration * 2}`;
};

export async function GET(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = context.params;
    const promptId = params.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const promptService = PromptService.getInstance();
    const prompt = await promptService.getPrompt(promptId);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Create response with security headers
    const response = NextResponse.json(prompt);

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add cache headers if the route is cacheable
    if (cacheConfig.cacheableRoutes.includes('/api/prompts/[id]')) {
      response.headers.set('Cache-Control', getCacheControl(cacheConfig.durations.medium));
      response.headers.set('Cache-Tag', cacheConfig.tags.prompts);
    }

    return response;
  } catch (error) {
    console.error('Error fetching prompt:', error);
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

export async function PUT(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = context.params;
    const promptId = params.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const promptService = PromptService.getInstance();
    const updatedPrompt = await promptService.updatePrompt(promptId, userId, body);

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = context.params;
    const promptId = params.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const promptService = PromptService.getInstance();
    await promptService.deletePrompt(promptId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
