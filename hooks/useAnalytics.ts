'use client';

import { useCallback } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  }, []);

  const trackPageView = useCallback((pagePath: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
        page_path: pagePath,
      });
    }
  }, []);

  const trackUserEngagement = useCallback((action: string, details?: string) => {
    trackEvent({
      action,
      category: 'User Engagement',
      label: details,
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    trackEvent({
      action,
      category: 'Feature Usage',
      label: feature,
    });
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: string) => {
    trackEvent({
      action: 'Error',
      category: 'Application',
      label: `${error}${context ? ` - ${context}` : ''}`,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackUserEngagement,
    trackFeatureUsage,
    trackError,
  };
}
