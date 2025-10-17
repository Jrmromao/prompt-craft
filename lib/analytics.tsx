'use client';

import React, { createContext, useContext, useEffect, Suspense } from 'react';
import { CookiePreferences } from '../components/cookies/CookieManager';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

// Declare gtag types
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

interface AnalyticsContextType {
  preferences: CookiePreferences;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
  preferences: CookiePreferences;
}

function AnalyticsContent({ children, preferences }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (preferences.analytics) {
      // Track page view in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        const search = searchParams.toString();
        const url = pathname + (search ? `?${search}` : '');
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
          page_path: url,
        });
      }
    }
  }, [preferences.analytics, pathname, searchParams]);

  return (
    <AnalyticsContext.Provider value={{ preferences }}>
      {children}
      {preferences.analytics && (
        <>
          <Analytics />
          <SpeedInsights />
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </>
      )}
    </AnalyticsContext.Provider>
  );
}

export function AnalyticsProvider(props: AnalyticsProviderProps) {
  return (
    <Suspense fallback={props.children}>
      <AnalyticsContent {...props} />
    </Suspense>
  );
}
