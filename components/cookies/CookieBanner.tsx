// components/CookieConsent/CookieBanner.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CookieManager, { CookiePreferences } from "./CookieManager";

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

export default function CookieBanner({
  onPreferencesChange,
}: CookieBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if we have stored preferences
    const storedPreferences = localStorage.getItem("cookie-preferences");
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
    localStorage.setItem("cookie-preferences", JSON.stringify(newPreferences));
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowManager(false);
    onPreferencesChange(newPreferences);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg p-4 z-50 animate-slide-up">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. You can customize your preferences by clicking "Manage Preferences". For more information, please read our{" "}
              <Link
                href="/privacy-policy"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/cookie-policy"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowManager(true)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Manage preferences
            </button>
            <button
              onClick={handleDeclineAll}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Decline all
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
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
