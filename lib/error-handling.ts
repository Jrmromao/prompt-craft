import { ErrorInfo } from 'react';

export interface ErrorDetails {
  error: Error;
  errorInfo?: ErrorInfo;
  timestamp: string;
  url: string;
  userAgent: string;
  componentStack?: string;
}

export const isConstructorError = (error: Error): boolean => {
  return (
    error.message.includes('Super constructor null') ||
    error.message.includes('is not a constructor')
  );
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

  // Here you can add your error tracking service integration
  // Example: Sentry.captureException(details.error, { extra: details });
};

export const getErrorRecoveryAction = (error: Error): 'reload' | 'retry' | 'fallback' => {
  if (isConstructorError(error)) {
    return 'reload';
  }

  // Add more specific error type checks here
  return 'retry';
};
