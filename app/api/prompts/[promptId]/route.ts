import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';

export async function GET(
  req: Request,
  { params }: { params: { promptId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const promptService = PromptService.getInstance();
    const prompt = await promptService.getPrompt(params.promptId);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the prompt
    if (prompt.userId !== userId && !prompt.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized to access this prompt' },
        { status: 403 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { promptId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, content, isPublic, tags } = body;

    const promptService = PromptService.getInstance();
    const prompt = await promptService.updatePrompt(
      params.promptId,
      userId,
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(typeof isPublic === 'boolean' && { isPublic }),
        ...(tags && { tags }),
      }
    );

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { promptId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const promptService = PromptService.getInstance();
    await promptService.deletePrompt(params.promptId, userId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}