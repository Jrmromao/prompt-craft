// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.RESEND_API_KEY = 'test_resend_api_key';
process.env.STRIPE_SECRET_KEY = 'test_stripe_secret_key';
process.env.STRIPE_WEBHOOK_SECRET = 'test_stripe_webhook_secret';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  headers() {
    return new Map();
  },
  cookies() {
    return new Map();
  },
}));

// Mock @clerk/nextjs
jest.mock('@clerk/nextjs', () => ({
  auth: () => Promise.resolve({ userId: 'test_user_id' }),
  currentUser: () => Promise.resolve({ id: 'test_user_id' }),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

// Mock @upstash/redis as a class
jest.mock('@upstash/redis', () => ({
  Redis: class {
    static fromEnv() {
      return {
        incr: jest.fn(),
        expire: jest.fn(),
        ttl: jest.fn(),
      };
    }
  },
}));

// Mock @upstash/ratelimit as a class
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    constructor() {}
    static slidingWindow() {
      return { limit: jest.fn() };
    }
  },
}));

// Mock Clerk server with correct structure
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: {
    sessions: {
      getSession: jest.fn(),
      revokeSession: jest.fn(),
    },
    users: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

// Mock resend
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock ThemeProvider useTheme
jest.mock('@/components/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

// Mock global Request object for API route tests
if (typeof global.Request === 'undefined') {
  global.Request = jest.fn().mockImplementation((input, init) => ({
    ...input,
    ...init,
    headers: new Headers(init?.headers),
    json: () => Promise.resolve(init?.body ? JSON.parse(init.body) : {}),
  }));
}

// Improved global Response mock for API route tests
if (typeof global.Response === 'undefined') {
  global.Response = class {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers || {};
      try {
        this._json = typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        this._json = null;
      }
    }
    json() {
      if (this._json !== null) return Promise.resolve(this._json);
      return Promise.reject(new Error('Invalid JSON'));
    }
    text() {
      return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
    }
  };
}

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
    error: jest.fn((error) => ({
      status: 500,
      json: () => Promise.resolve({ error }),
    })),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollIntoView for JSDOM (Radix UI Select)
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
} 