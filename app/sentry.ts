import * as Sentry from '@sentry/nextjs';
import { Replay } from '@sentry/replay';

export const initSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'development',
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      integrations: [
        new Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  }
}; 