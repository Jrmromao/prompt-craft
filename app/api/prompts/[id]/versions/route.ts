import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';
import { z } from 'zod';

const createVersionSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  commitMessage: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versionControlService = VersionControlService.getInstance();
    const versions = await versionControlService.getVersion(params.id);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Received POST request for versions');
    console.log('Params:', params);
    
    const { userId } = await auth();
    if (!userId) {
      console.log('Unauthorized: No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = params.id;
    if (!promptId) {
      console.log('Bad request: No promptId');
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const validationResult = createVersionSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.format());
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { content, description, commitMessage, tags } = validationResult.data;
    console.log('Creating version with:', { content, description, commitMessage, tags });
    
    const versionControlService = VersionControlService.getInstance();
    const newVersion = await versionControlService.createVersion(
      promptId,
      content,
      description || null,
      commitMessage,
      tags || []
    );

    console.log('Version created successfully:', newVersion);
    return NextResponse.json(newVersion);
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create version' },
      { status: 500 }
    );
  }
}
