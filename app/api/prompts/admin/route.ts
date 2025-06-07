import { NextResponse } from 'next/server';
import { PromptService } from '@/lib/services/promptService';
import { requireAdmin } from '@/lib/auth';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// GET: List pending prompts
export async function GET() {
  try {
    await requireAdmin();
    const promptService = PromptService.getInstance();
    const pending = await promptService.getPendingPrompts();
    return NextResponse.json(pending);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

// Define the main handler
async function promptsAdminHandler(req: Request) {
  try {
    await requireAdmin();
    const { promptId } = await req.json();
    const promptService = PromptService.getInstance();
    const approved = await promptService.approvePrompt(promptId);
    return NextResponse.json(approved);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(promptsAdminHandler, fallbackData);

// DELETE: Reject a prompt (expects { promptId })
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { promptId } = await req.json();
    const promptService = PromptService.getInstance();
    await promptService.rejectPrompt(promptId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
