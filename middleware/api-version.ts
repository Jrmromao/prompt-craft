import { NextRequest, NextResponse } from 'next/server';

// Supported API versions
export const SUPPORTED_VERSIONS = ['v1', 'v2'] as const;
export type ApiVersion = (typeof SUPPORTED_VERSIONS)[number];

// Default API version
export const DEFAULT_VERSION: ApiVersion = 'v1';

// Version deprecation dates
export const VERSION_DEPRECATION_DATES: Record<ApiVersion, string | null> = {
  v1: null, // Not deprecated
  v2: null, // Not deprecated
};

export function apiVersionMiddleware(req: NextRequest) {
  // Extract version from URL path
  const path = req.nextUrl.pathname;
  const versionMatch = path.match(/^\/api\/(v\d+)\//);

  if (!versionMatch) {
    // If no version specified, use default version
    const newUrl = new URL(req.url);
    newUrl.pathname = `/api/${DEFAULT_VERSION}${path.replace(/^\/api/, '')}`;
    return NextResponse.redirect(newUrl);
  }

  const version = versionMatch[1] as ApiVersion;

  // Check if version is supported
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unsupported API version',
        message: `API version ${version} is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Check if version is deprecated
  const deprecationDate = VERSION_DEPRECATION_DATES[version];
  if (deprecationDate) {
    const response = NextResponse.next();
    response.headers.set('Deprecation', `true; date="${deprecationDate}"`);
    response.headers.set('Sunset', deprecationDate);
    return response;
  }

  return null;
}

// Helper function to get current API version from request
export function getApiVersion(req: NextRequest): ApiVersion {
  const path = req.nextUrl.pathname;
  const versionMatch = path.match(/^\/api\/(v\d+)\//);
  return (versionMatch?.[1] as ApiVersion) || DEFAULT_VERSION;
}
