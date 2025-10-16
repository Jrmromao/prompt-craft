'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptAll = async () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    
    // Track consent
    try {
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'cookies',
          granted: true,
          preferences: { necessary: true, analytics: true, marketing: false },
        }),
      });
    } catch (error) {
      console.error('Failed to track consent:', error);
    }
    
    setShow(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">🍪 We use cookies</h3>
            <p className="text-sm text-gray-600">
              We use necessary cookies to make our site work. We'd also like to set analytics cookies to help us improve it. 
              We won't set analytics cookies unless you enable them.
            </p>
          </div>
          
          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={acceptNecessary}
              className="whitespace-nowrap"
            >
              Necessary Only
            </Button>
            <Button
              onClick={acceptAll}
              className="whitespace-nowrap"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
