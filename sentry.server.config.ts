// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Set the environment
  environment: process.env.NODE_ENV,

  // Set the release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Configure server-side integrations
  integrations: [
    Sentry.httpIntegration(),
    Sentry.prismaIntegration(),
  ],

  // Data scrubbing for sensitive information
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Remove sensitive user data
    if (event.user) {
      delete event.user.email;
      delete event.user.name;
      delete event.user.username;
    }

    // Scrub sensitive fields from extra data
    if (event.extra) {
      Object.keys(event.extra).forEach(key => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('auth')) {
          event.extra![key] = '[REDACTED]';
        }
      });
    }

    // Scrub sensitive fields from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs.forEach(breadcrumb => {
        if (breadcrumb.data) {
          Object.keys(breadcrumb.data).forEach(key => {
            if (key.toLowerCase().includes('password') || 
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('secret') ||
                key.toLowerCase().includes('key')) {
              breadcrumb.data![key] = '[REDACTED]';
            }
          });
        }
      });
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'Network request failed',
    'Failed to fetch',
    'NetworkError when attempting to fetch resource',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
