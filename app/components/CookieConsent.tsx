'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
        <Button onClick={handleAccept} className="ml-4">Accept</Button>
      </div>
    </div>
  );
} 