import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings2 } from 'lucide-react';
import CookieManager from './CookieManager';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consentStatus = localStorage.getItem('cookie-consent-status');
    if (!consentStatus) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent-status', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent-status', 'declined');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/80 backdrop-blur-sm p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900/80"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="hidden rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/50 sm:block">
                  <Cookie className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    We value your privacy
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    We use cookies to enhance your browsing experience, serve personalized content, and
                    analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of
                    cookies.{' '}
                    <a
                      href="/legal/privacy-policy"
                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Read our Cookie Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  className="flex-1 sm:flex-none"
                >
                  Decline All
                </Button>
                <CookieManager />
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 sm:flex-none"
                >
                  Accept All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
