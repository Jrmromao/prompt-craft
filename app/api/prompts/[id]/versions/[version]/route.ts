import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id, version } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!version) {
      return NextResponse.json({ error: 'Version parameter is required' }, { status: 400 });
    }

    const versionControlService = VersionControlService.getInstance();
    const versionData = await versionControlService.getVersion(version);

    if (!versionData) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json(versionData);
  } catch (error) {
    console.error('Error getting version:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id, version } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!version) {
      return NextResponse.json({ error: 'Version parameter is required' }, { status: 400 });
    }

    const { compareWith } = await request.json();

    if (!compareWith) {
      return NextResponse.json({ error: 'compareWith parameter is required' }, { status: 400 });
    }

    const versionControlService = VersionControlService.getInstance();
    const result = await versionControlService.compareVersions(version, compareWith);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error comparing versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
