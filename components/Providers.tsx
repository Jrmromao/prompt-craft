'use client';

import { useState, useEffect } from 'react';
import { AnalyticsProvider } from '@/lib/analytics';
import CookieBanner from '@/components/cookies/CookieBanner';
import { CookiePreferences } from '@/components/cookies/CookieManager';
import { ClerkProvider } from '@clerk/nextjs';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const storedPreferences = localStorage.getItem('cookie-preferences');
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences));
    }
  }, []);

  return (
    <ClerkProvider>
      <AnalyticsProvider preferences={preferences}>
        {children}
        <CookieBanner onPreferencesChange={setPreferences} />
      </AnalyticsProvider>
    </ClerkProvider>
  );
}
