// components/CookieConsent/CookieManager.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  preferences: boolean;
};

interface CookieManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: CookiePreferences) => void;
  initialPreferences: CookiePreferences;
}

export default function CookieManager({
  isOpen,
  onClose,
  onSave,
  initialPreferences,
}: CookieManagerProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(initialPreferences);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-gray-900">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cookie Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-4 space-y-6">
            {/* Necessary Cookies */}
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Essential Cookies</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Always active</span>
                </div>
                <div className="relative inline-block">
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-emerald-600"
                  >
                    <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                These cookies are necessary for the website to function and cannot be switched off.
                They are usually only set in response to actions made by you which amount to a
                request for services, such as setting your privacy preferences, logging in or
                filling in forms.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() =>
                      setPreferences(prev => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.analytics ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                These cookies help us understand how visitors interact with our website by
                collecting and reporting information anonymously. They help us to know which pages
                are the most and least popular and see how visitors move around the site.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Functional Cookies</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() =>
                      setPreferences(prev => ({
                        ...prev,
                        functional: !prev.functional,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.functional ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.functional ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                These cookies enable the website to provide enhanced functionality and
                personalization. They may be set by us or by third-party providers whose services we
                have added to our pages.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Marketing Cookies</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() =>
                      setPreferences(prev => ({
                        ...prev,
                        marketing: !prev.marketing,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.marketing ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                These cookies are used to track visitors across websites. The intention is to
                display ads that are relevant and engaging for the individual user and thereby more
                valuable for publishers and third-party advertisers.
              </p>
            </div>

            {/* Preferences Cookies */}
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Preferences Cookies</h3>
                <div className="relative inline-block">
                  <button
                    onClick={() =>
                      setPreferences(prev => ({
                        ...prev,
                        preferences: !prev.preferences,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.preferences ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.preferences ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                These cookies allow the website to remember choices you make (such as your username,
                language, or the region you are in) and provide enhanced, more personal features.
              </p>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>
                For more information about how we use cookies and your data, please read our{' '}
                <Link
                  href="/privacy-policy"
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/cookie-policy"
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
