import { NextResponse } from 'next/server';

// Generic error responses to prevent information disclosure during pentests
export const GENERIC_ERRORS = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Invalid request data',
  RATE_LIMITED: 'Too many requests',
  SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
} as const;

export function createSecureErrorResponse(
  error: keyof typeof GENERIC_ERRORS,
  statusCode: number,
  includeDetails: boolean = false,
  details?: any
) {
  const response = {
    success: false,
    error: GENERIC_ERRORS[error],
    ...(includeDetails && process.env.NODE_ENV === 'development' && { details }),
  };

  return NextResponse.json(response, { status: statusCode });
}

export function sanitizeErrorForProduction(error: any): string {
  // In production, never expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return GENERIC_ERRORS.SERVER_ERROR;
  }
  
  // In development, provide helpful error messages
  return error?.message || GENERIC_ERRORS.SERVER_ERROR;
}
