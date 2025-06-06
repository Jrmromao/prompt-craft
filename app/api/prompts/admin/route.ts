import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';

// Pseudo admin check (replace with real check in production)
async function requireAdmin() {
  const { userId } = await auth();
  // TODO: Replace with real admin check
  if (!userId /* || !isAdmin(userId) */) {
    throw new Error('Unauthorized');
  }
  return userId;
}

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

// POST: Approve a prompt (expects { promptId })
export async function POST(req: Request) {
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
