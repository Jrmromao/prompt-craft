import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function versionHandler(
  request: Request,
  context?: { params?: Record<string, string> }
) {
  const { id, version } = context?.params || {};
  if (!version) {
    return NextResponse.json({ error: 'Version parameter is required' }, { status: 400 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(versionHandler, fallbackData);
