import * as Sentry from '@sentry/nextjs';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Wrapper for API route handlers that automatically:
 * - Sets user context from Clerk
 * - Captures errors with Sentry
 * - Adds request context
 */
export async function withErrorTracking<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    try {
      // Get user context from Clerk
      const { userId } = await auth();
      
      // Set user context for Sentry
      if (userId) {
        Sentry.setUser({ id: userId });
      } else {
        Sentry.setUser(null);
      }

      // Execute the handler
      return await handler(req);
    } catch (error) {
      // Capture error with Sentry
      Sentry.captureException(error, {
        tags: {
          apiRoute: true,
        },
        extra: {
          userId: (await auth()).userId || 'anonymous',
        },
      });

      // Re-throw the error to maintain normal error handling
      throw error;
    }
  };
}

/**
 * Higher-order function for API routes that need error tracking
 * Usage: export const POST = withApiErrorTracking(async (req) => { ... });
 */
export function withApiErrorTracking<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return withErrorTracking(handler);
}

/**
 * Utility to manually capture API errors with context
 */
export function captureApiError(
  error: Error,
  context: {
    endpoint?: string;
    method?: string;
    userId?: string;
    requestId?: string;
    [key: string]: any;
  } = {}
) {
  Sentry.captureException(error, {
    tags: {
      apiRoute: true,
      endpoint: context.endpoint,
      method: context.method,
    },
    extra: {
      ...context,
      userId: context.userId || 'anonymous',
    },
  });
}

/**
 * Utility to add breadcrumbs for API operations
 */
export function addApiBreadcrumb(
  message: string,
  category: string = 'api',
  level: 'info' | 'warning' | 'error' = 'info',
  data: Record<string, any> = {}
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}
