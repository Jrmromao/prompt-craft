'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { 
  isConstructorError, 
  handleConstructorError, 
  logError, 
  getErrorRecoveryAction,
  type ErrorDetails 
} from '@/lib/error-handling';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  recoveryAttempted: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempted: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      recoveryAttempted: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

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

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
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

  handleReset = () => {
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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isConstructorErr = this.state.error && isConstructorError(this.state.error);

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
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
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                  <p className="text-red-500 font-mono">{this.state.error.toString()}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  aria-label="Try again"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isConstructorErr ? 'Reload Page' : 'Try Again'}
                </button>
                
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
