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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const versionControlService = VersionControlService.getInstance();
    const versions = await versionControlService.getVersion(params.id);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = createVersionSchema.parse(body);

    const versionControlService = VersionControlService.getInstance();
    const newVersion = await versionControlService.createVersion(
      params.id,
      validatedData.content,
      validatedData.description || null,
      validatedData.commitMessage,
      validatedData.tags || []
    );

    return NextResponse.json(newVersion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error('Error creating version:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
