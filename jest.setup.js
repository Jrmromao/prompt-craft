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

// Mock @clerk/nextjs - following Clerk's testing best practices
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test_user_id' })),
  currentUser: jest.fn(() => Promise.resolve({ 
    id: 'test_user_id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User'
  })),
  clerkClient: {
    users: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
    sessions: {
      getSession: jest.fn(),
      revokeSession: jest.fn(),
    },
  },
  useAuth: jest.fn(() => ({ userId: 'test_user_id', isSignedIn: true })),
  useUser: jest.fn(() => ({ 
    user: { 
      id: 'test_user_id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User'
    },
    isLoaded: true 
  })),
  ClerkProvider: ({ children }) => children,
  SignIn: () => '<div data-testid="clerk-sign-in">Sign In Component</div>',
  SignUp: () => '<div data-testid="clerk-sign-up">Sign Up Component</div>',
}));

// Mock @clerk/nextjs/server
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test_user_id' })),
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

// Mock resend
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Define Prisma enums to fix the undefined enum issues
const PlanType = {
  FREE: 'FREE',
  PRO: 'PRO',
  ELITE: 'ELITE',
  ENTERPRISE: 'ENTERPRISE'
};

const VoteAbuseType = {
  SELF_VOTE_ATTEMPT: 'SELF_VOTE_ATTEMPT',
  SUSPICIOUS_ACCOUNT_AGE: 'SUSPICIOUS_ACCOUNT_AGE',
  EXCESSIVE_VOTING_RATE: 'EXCESSIVE_VOTING_RATE',
  IP_CLUSTERING: 'IP_CLUSTERING',
  COORDINATED_VOTING: 'COORDINATED_VOTING',
  RAPID_VOTING_PATTERN: 'RAPID_VOTING_PATTERN',
  TEMPORAL_VOTING_PATTERN: 'TEMPORAL_VOTING_PATTERN',
  VOTE_MANIPULATION: 'VOTE_MANIPULATION',
  DEVICE_FINGERPRINTING: 'DEVICE_FINGERPRINTING',
  SOCKPUPPET_VOTING: 'SOCKPUPPET_VOTING'
};

const VoteAbuseSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

const VoteAbuseStatus = {
  PENDING: 'PENDING',
  INVESTIGATING: 'INVESTIGATING',
  CONFIRMED: 'CONFIRMED',
  FALSE_POSITIVE: 'FALSE_POSITIVE',
  RESOLVED: 'RESOLVED'
};

const CreditType = {
  SIGNUP: 'SIGNUP',
  UPVOTE: 'UPVOTE',
  PURCHASE: 'PURCHASE',
  REFERRAL: 'REFERRAL',
  BONUS: 'BONUS'
};

// Mock prisma with proper enum definitions
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    vote: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    voteReward: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    voteAbuseDetection: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    votePattern: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    prompt: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    credit: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock @prisma/client to include enums
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  PlanType,
  VoteAbuseType,
  VoteAbuseSeverity,
  VoteAbuseStatus,
  CreditType,
}));

// Mock email and audit services
jest.mock('@/lib/services/emailService', () => ({
  EmailService: {
    getInstance: jest.fn(() => ({
      sendEmail: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    getInstance: jest.fn(() => ({
      logAudit: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/services/creditService', () => ({
  CreditService: {
    getInstance: jest.fn(() => ({
      addCredits: jest.fn(),
      deductCredits: jest.fn(),
      getUserCredits: jest.fn(),
    })),
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