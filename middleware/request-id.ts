import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Request ID header name
export const REQUEST_ID_HEADER = 'X-Request-ID';

export function requestIdMiddleware(req: NextRequest) {
  const response = NextResponse.next();

  // Get existing request ID or generate new one
  const requestId = req.headers.get(REQUEST_ID_HEADER) || uuidv4();

  // Add request ID to response headers
  response.headers.set(REQUEST_ID_HEADER, requestId);

  // Add request ID to request headers for downstream services
  req.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

// Helper function to get request ID from request
export function getRequestId(req: NextRequest): string {
  return req.headers.get(REQUEST_ID_HEADER) || uuidv4();
}

// Helper function to get request ID from response
export function getRequestIdFromResponse(response: NextResponse): string | null {
  return response.headers.get(REQUEST_ID_HEADER);
}
