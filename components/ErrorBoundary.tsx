'use client';

import React, { Component, ErrorInfo } from 'react';
import * as Sentry from '@sentry/nextjs';
import { logError, isConstructorError } from '@/lib/error-handling';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  recoveryAttempted: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      recoveryAttempted: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      recoveryAttempted: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Log the error to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      Sentry.captureException(error);
    });

    // Log the error to our system
    logError({
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      componentStack: errorInfo.componentStack,
    });

    // Handle constructor errors specifically
    if (isConstructorError(error) && !this.state.recoveryAttempted) {
      this.setState({ recoveryAttempted: true });
      this.handleConstructorError(error);
    }

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleConstructorError(error: Error) {
    try {
      // Clear any cached data that might be causing the issue
      localStorage.removeItem('cookie-preferences');
      sessionStorage.clear();
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error('Failed to handle constructor error:', e);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              We've been notified and are working to fix the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
