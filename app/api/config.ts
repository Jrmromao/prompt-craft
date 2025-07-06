// Mark all API routes as dynamic
export const dynamic = 'force-dynamic';

// Set runtime to nodejs
export const runtime = 'nodejs' as const;

// Add security headers to all responses
export const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.stripe.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Rate limiting configuration
export const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
};

// Cache configuration
export const cacheConfig = {
  // Routes that can be cached
  cacheableRoutes: [
    '/api/prompts/[id]',
    '/api/comments/[id]',
    '/api/user/[id]',
    '/api/account(.*)',
    '/api/profile/[id]',
    '/api/settings/[id]',
  ],
  // Cache durations
  durations: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    veryLong: 86400, // 24 hours
  },
  // Cache tags for invalidation
  tags: {
    prompts: 'prompts',
    comments: 'comments',
    users: 'users',
    profiles: 'profiles',
    settings: 'settings',
    analytics: 'analytics',
  },
};
