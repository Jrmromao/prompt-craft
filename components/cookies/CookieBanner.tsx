// components/CookieConsent/CookieBanner.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CookieManager, { CookiePreferences } from './CookieManager';

interface CookieBannerProps {
  onPreferencesChange: (preferences: CookiePreferences) => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
  preferences: false,
};

export default function CookieBanner({ onPreferencesChange }: CookieBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if we have stored preferences
    const storedPreferences = localStorage.getItem('cookie-preferences');
    if (!storedPreferences) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(storedPreferences);
      setPreferences(parsed);
      onPreferencesChange(parsed);
    }
  }, [onPreferencesChange]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
  };

  const handleDeclineAll = () => {
    const allDeclined: CookiePreferences = {
      necessary: true, // Always true
      analytics: false,
      functional: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(allDeclined);
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem('cookie-preferences', JSON.stringify(newPreferences));
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowManager(false);
    onPreferencesChange(newPreferences);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="animate-slide-up fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use cookies to enhance your browsing experience, serve personalized content, and
              analyze our traffic. By clicking "Accept All", you consent to our use of cookies. You
              can customize your preferences by clicking "Manage Preferences". For more information,
              please read our{' '}
              <Link
                href="/privacy-policy"
                className="text-emerald-600 underline-offset-2 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                href="/cookie-policy"
                className="text-emerald-600 underline-offset-2 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setShowManager(true)}
              className="text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Manage preferences
            </button>
            <button
              onClick={handleDeclineAll}
              className="rounded-md px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Decline all
            </button>
            <button
              onClick={handleAcceptAll}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>

      <CookieManager
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        onSave={savePreferences}
        initialPreferences={preferences}
      />
    </>
  );
}
