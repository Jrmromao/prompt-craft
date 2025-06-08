import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';

export async function POST(
  request: Request,
  { params }: { params: { id: string; version: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { compareWith } = body;

    if (!compareWith) {
      return new NextResponse('Comparison version is required', { status: 400 });
    }

    const versionControlService = VersionControlService.getInstance();
    const result = await versionControlService.compareVersions(params.version, compareWith);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error comparing versions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
