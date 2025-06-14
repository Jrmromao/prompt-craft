// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Set the environment
  environment: process.env.NODE_ENV,

  // Set the release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Configure server-side integrations
  integrations: [
    Sentry.httpIntegration(),
    Sentry.prismaIntegration(),
  ],
});
