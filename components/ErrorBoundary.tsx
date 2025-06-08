'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import {
  isConstructorError,
  handleConstructorError,
  logError,
  getErrorRecoveryAction,
  type ErrorDetails,
} from '@/lib/error-handling';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  recoveryAttempted: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    recoveryAttempted: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      recoveryAttempted: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Log the error
    logError({
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      componentStack: errorInfo?.componentStack || undefined,
    });

    // Handle constructor errors specifically
    if (isConstructorError(error) && !this.state.recoveryAttempted) {
      this.setState({ recoveryAttempted: true });
      handleConstructorError(error);
    }

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children &&
      this.state.hasError
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        recoveryAttempted: false,
      });
    }
  }

  public handleReset = () => {
    const { error } = this.state;
    if (error) {
      const recoveryAction = getErrorRecoveryAction(error);

      switch (recoveryAction) {
        case 'reload':
          window.location.reload();
          break;
        case 'retry':
          this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            recoveryAttempted: false,
          });
          break;
        case 'fallback':
          // Keep the error state but show fallback UI
          break;
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isConstructorErr = this.state.error && isConstructorError(this.state.error);

      return (
        <div
          className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isConstructorErr ? 'Application Error' : 'Something went wrong'}
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                {isConstructorErr
                  ? 'We encountered an application error. The page will reload automatically.'
                  : 'We apologize for the inconvenience. Our team has been notified of this issue.'}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-700">
                  <p className="font-mono text-red-500">{this.state.error.toString()}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                  aria-label="Try again"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isConstructorErr ? 'Reload Page' : 'Try Again'}
                </button>

                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  aria-label="Go to home page"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
