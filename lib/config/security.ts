export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    API_DEFAULT: { requests: 100, window: '15m' },
    AUTH: { requests: 5, window: '15m' },
    PASSWORD_CHANGE: { requests: 3, window: '1h' },
    ADMIN: { requests: 50, window: '15m' },
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    SPECIAL_CHARS: '@$!%*?&',
  },

  // Session security
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SECURE_COOKIES: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict' as const,
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
    STYLE_SRC: ["'self'", "'unsafe-inline'"],
    IMG_SRC: ["'self'", "data:", "https:"],
    FONT_SRC: ["'self'", "https:"],
    CONNECT_SRC: ["'self'", "https:"],
    FRAME_SRC: ["https://js.stripe.com"],
  },

  // File upload restrictions
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    SCAN_FOR_MALWARE: true,
  },

  // API security
  API: {
    MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
    REQUIRE_HTTPS: process.env.NODE_ENV === 'production',
    CORS_ORIGINS: [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000', // Development
    ].filter(Boolean),
  },

  // Audit logging
  AUDIT: {
    LOG_ALL_REQUESTS: false,
    LOG_SENSITIVE_OPERATIONS: true,
    RETENTION_DAYS: 90,
  },
} as const;

export const SENSITIVE_OPERATIONS = [
  'USER_DELETE',
  'ROLE_CHANGE',
  'PASSWORD_CHANGE',
  'API_KEY_GENERATE',
  'ADMIN_ACTION',
  'PAYMENT_PROCESS',
] as const;

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;
