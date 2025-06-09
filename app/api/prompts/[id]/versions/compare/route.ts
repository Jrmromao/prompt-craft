import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';
import { z } from 'zod';

const compareSchema = z.object({
  version1: z.string().min(1),
  version2: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = compareSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { version1, version2 } = validationResult.data;
    const versionControlService = VersionControlService.getInstance();
    const diff = await versionControlService.compareVersions(version1, version2);

    return NextResponse.json(diff);
  } catch (error) {
    console.error('Error comparing versions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compare versions' },
      { status: 500 }
    );
  }
} 