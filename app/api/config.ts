// Mark all API routes as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Security headers to be added to all responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};

// Cache configuration
export const cacheConfig = {
  // Routes that can be cached
  cacheableRoutes: [
    '/api/prompts/[id]',
    '/api/comments/[id]',
    '/api/user/[id]',
    '/api/profile/[id]',
    '/api/settings/[id]',
  ],
  
  // Cache duration in seconds
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
  },
}; 