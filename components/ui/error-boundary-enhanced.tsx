'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export default class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      })
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state
    
    if (retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      })

      // Auto-retry with exponential backoff
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 1000
        this.retryTimeoutId = setTimeout(() => {
          this.forceUpdate()
        }, delay)
      }
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, retryCount } = this.state
      const canRetry = retryCount < 3

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                We encountered an unexpected error. Don't worry, we're working to fix it.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error details (development only) */}
              {this.props.showDetails && error && (
                <details className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto text-xs">
                        {error.stack}
                      </pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-auto text-xs">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Retry count indicator */}
              {retryCount > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Retry attempt {retryCount} of 3
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Report issue */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Still having issues?
                </p>
                <Button
                  onClick={() => {
                    // Open support or report issue
                    window.open('mailto:support@optirelay.com?subject=Error Report', '_blank')
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <Bug className="w-3 h-3 mr-1" />
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
