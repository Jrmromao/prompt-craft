'use client';

import { useState, useEffect } from 'react';
import { AnalyticsProvider } from '@/lib/analytics';
import { isConstructorError, logError } from '@/lib/error-handling';
import CookieBanner from '@/components/cookies/CookieBanner';
import { CookiePreferences } from '@/components/cookies/CookieManager';
import ErrorBoundary from '@/components/ErrorBoundary';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
  preferences: false,
};

const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log the error with additional context
  logError({
    error,
    errorInfo,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    componentStack: errorInfo?.componentStack || undefined,
  });

  // If it's a constructor error, we might want to clear any cached data
  if (isConstructorError(error)) {
    try {
      // Clear any cached data that might be causing the issue
      localStorage.removeItem('cookie-preferences');
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsClient(true);
        const storedPreferences = localStorage.getItem('cookie-preferences');
        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences));
        }
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
        // Reset to default preferences if there's an error
        setPreferences(defaultPreferences);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={handleError}
      resetOnPropsChange={true}
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Application Error
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
        </div>
      }
    >
      <AnalyticsProvider preferences={preferences}>
        {children}
        <CookieBanner onPreferencesChange={setPreferences} />
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}
