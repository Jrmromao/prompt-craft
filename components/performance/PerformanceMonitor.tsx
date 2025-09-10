'use client';

import { useEffect } from 'react';

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Custom performance marks
    performance.mark('app-start');
    
    // Measure when app becomes interactive
    const measureInteractive = () => {
      performance.mark('app-interactive');
      performance.measure('app-load-time', 'app-start', 'app-interactive');
      
      const measure = performance.getEntriesByName('app-load-time')[0];
      if (measure) {
        // Send to analytics endpoint
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'app-load-time',
            value: measure.duration,
            rating: measure.duration < 3000 ? 'good' : measure.duration < 5000 ? 'needs-improvement' : 'poor',
            delta: measure.duration,
            id: 'app-load-time',
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          }),
        }).catch(console.error);
      }
    };

    // Measure when document is ready
    if (document.readyState === 'complete') {
      measureInteractive();
    } else {
      window.addEventListener('load', measureInteractive);
    }

    return () => {
      window.removeEventListener('load', measureInteractive);
    };
  }, []);

  return null;
};
