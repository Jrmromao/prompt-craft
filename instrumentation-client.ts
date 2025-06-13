// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { browserTracingIntegration } from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Session Replay
      maskAllText: true,
      blockAllMedia: true,
    }),
    // send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] }),
    // Performance monitoring
    browserTracingIntegration(),
  ],

  // Enable logs
  _experiments: {
    enableLogs: true,
  },

  // Define how likely traces are sampled. Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Define how likely Replay events are sampled.
  // In production, we want to sample at a lower rate to reduce costs
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Always capture replays when an error occurs
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Set the environment
  environment: process.env.NODE_ENV,

  // Set the release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Configure error sampling
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },

  // Configure error tracking
  ignoreErrors: [
    // Ignore specific errors that are not relevant
    "Network request failed",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;