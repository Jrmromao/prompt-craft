import { ErrorInfo } from 'react';
import * as Sentry from '@sentry/nextjs';

export interface ErrorDetails {
  error: Error;
  errorInfo?: React.ErrorInfo;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  componentStack?: string;
  userId?: string;
  [key: string]: any;
}

export const isConstructorError = (error: Error): boolean => {
  return error.message.includes('constructor') || error.stack?.includes('constructor');
};

export const handleConstructorError = (error: Error): void => {
  // Clear any cached modules that might be causing the issue
  if (typeof window !== 'undefined') {
    // Clear module cache if possible
    if ('__NEXT_DATA__' in window) {
      try {
        // Force a hard reload to clear any cached modules
        window.location.reload();
      } catch (e) {
        console.error('Failed to reload page:', e);
      }
    }
  }
};

export const logError = (details: ErrorDetails): void => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: details.error.message,
      url: details.url,
    });
  }

  // Log to Sentry
  Sentry.withScope((scope) => {
    // Add user context if available
    if (details.userId) {
      scope.setUser({ id: details.userId });
    }

    // Add additional context
    scope.setExtra('timestamp', details.timestamp);
    scope.setExtra('url', details.url);
    scope.setExtra('userAgent', details.userAgent);
    scope.setExtra('componentStack', details.componentStack);

    // Capture the error
    Sentry.captureException(details.error);
  });
};

export const getErrorRecoveryAction = (error: Error): 'reload' | 'retry' | 'fallback' => {
  if (isConstructorError(error)) {
    return 'reload';
  }

  // Add more specific error type checks here
  return 'retry';
};
