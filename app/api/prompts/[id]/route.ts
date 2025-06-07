import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function promptDetailHandler(request?: Request) {
  if (!request) {
    return NextResponse.json({ error: 'Request is required' }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Extract id from the URL
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  const promptService = PromptService.getInstance();
  const prompt = await promptService.getPrompt(id!);

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  }

  return NextResponse.json(prompt);
}

// Define fallback data
const fallbackData = {
  id: '',
  name: '',
  content: '',
  description: '',
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: '',
  tags: [],
  upvotes: 0,
  copyCount: 0,
  viewCount: 0,
  usageCount: 0,
};

// Export the wrapped handler
export const GET = withDynamicRoute(promptDetailHandler, fallbackData);
