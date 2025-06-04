import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';

export async function GET(
  req: Request,
  context: { params: Promise<{ promptId: string }> }
): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { promptId } = await context.params;
    const promptService = PromptService.getInstance();
    const prompt = await promptService.getPrompt(promptId);

    if (!prompt) {
      return Response.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the prompt
    if (prompt.userId !== userId && !prompt.isPublic) {
      return Response.json(
        { error: 'Unauthorized to access this prompt' },
        { status: 403 }
      );
    }

    return Response.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return Response.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ promptId: string }> }
): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { promptId } = await context.params;
    const body = await req.json();
    const { title, content, isPublic, tags } = body;

    const promptService = PromptService.getInstance();
    const prompt = await promptService.updatePrompt(
      promptId,
      userId,
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(typeof isPublic === 'boolean' && { isPublic }),
        ...(tags && { tags }),
      }
    );

    return Response.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return Response.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ promptId: string }> }
): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { promptId } = await context.params;
    const promptService = PromptService.getInstance();
    await promptService.deletePrompt(promptId, userId);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return Response.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}

// --- Upvote endpoint ---
export async function POST(
  req: Request,
  context: { params: Promise<{ promptId: string }> }
): Promise<Response> {
  try {
    const { promptId } = await context.params;
    const promptService = PromptService.getInstance();
    const updatedPrompt = await promptService.upvotePrompt(promptId);
    return Response.json(updatedPrompt);
  } catch (error) {
    console.error('Error upvoting prompt:', error);
    return Response.json(
      { error: 'Failed to upvote prompt' },
      { status: 500 }
    );
  }
}