'use client';

import { useState, useEffect } from 'react';
import { AnalyticsProvider } from '@/lib/analytics';
import CookieBanner from '@/components/cookies/CookieBanner';
import { CookiePreferences } from '@/components/cookies/CookieManager';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
  preferences: false,
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedPreferences = localStorage.getItem('cookie-preferences');
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <AnalyticsProvider preferences={preferences}>
      {children}
      <CookieBanner onPreferencesChange={setPreferences} />
    </AnalyticsProvider>
  );
}
