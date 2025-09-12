import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export function withSecurityHeaders(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const response = await handler(req, context);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src https://js.stripe.com;"
    );

    return response;
  };
}

export function withCSRFProtection(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return handler(req, context);
    }

    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host');

    // Check origin/referer for state-changing requests
    if (!origin && !referer) {
      return NextResponse.json(
        { success: false, error: 'Missing origin header' },
        { status: 403 }
      );
    }

    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`, // For development
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);

    const requestOrigin = origin || (referer ? new URL(referer).origin : null);
    
    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
      return NextResponse.json(
        { success: false, error: 'Invalid origin' },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}

export function withInputSanitization(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Add request size limit
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { success: false, error: 'Request too large' },
        { status: 413 }
      );
    }

    return handler(req, context);
  };
}
