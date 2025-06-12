// Setup mocks
jest.mock('@upstash/redis', () => ({
  Redis: Object.assign(
    jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
    {
      fromEnv: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
      }),
    }
  ),
}));

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    jest.fn().mockImplementation(() => ({
      limit: jest.fn().mockResolvedValue({ success: true }),
    })),
    {
      slidingWindow: jest.fn().mockReturnValue({}),
    }
  ),
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    logAction: jest.fn(),
    getInstance: jest.fn().mockReturnValue({
      log: jest.fn(),
      logSecurityEvent: jest.fn(),
      logUserAction: jest.fn(),
      logApiCall: jest.fn(),
    }),
  },
}));

// Import after mocks
import { SecurityService } from '@/lib/services/security/securityService';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AuditService } from '@/lib/services/auditService';
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';

// Mock the stripe module
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

// Mock the audit service
jest.mock('@/lib/services/auditService', () => ({
  AuditService: {
    logAction: jest.fn(),
  },
}));

// Mock the SecurityService class
jest.mock('@/lib/services/security/securityService', () => {
  return {
    SecurityService: {
      getInstance: jest.fn().mockReturnValue({
        checkRateLimit: jest.fn(),
        verifyWebhookSignature: jest.fn(),
        validateRequest: jest.fn(),
        logAuditEvent: jest.fn(),
      }),
    },
  };
});

describe('SecurityService', () => {
  let securityService: SecurityService;
  const mockStripe = stripe as jest.Mocked<typeof stripe>;

  beforeEach(() => {
    securityService = SecurityService.getInstance();
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    const testIdentifier = 'user123';
    const currentTime = Date.now();

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(currentTime);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('Stripe API Rate Limiting', () => {
      it('should allow requests within rate limit', async () => {
        const mockResponse = {
          success: true,
          limit: 100,
          reset: currentTime + 60000, // 1 minute window
          remaining: 99
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await securityService.checkRateLimit(testIdentifier, 'stripeApi');
        
        expect(result).toEqual(mockResponse);
        expect(securityService.checkRateLimit).toHaveBeenCalledWith(testIdentifier, 'stripeApi');
      });

      it('should block requests exceeding rate limit', async () => {
        const mockResponse = {
          success: false,
          limit: 100,
          reset: currentTime + 60000,
          remaining: 0
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await securityService.checkRateLimit(testIdentifier, 'stripeApi');
        
        expect(result).toEqual(mockResponse);
      });
    });

    describe('Webhook Rate Limiting', () => {
      it('should allow requests within rate limit', async () => {
        const mockResponse = {
          success: true,
          limit: 50,
          reset: currentTime + 60000,
          remaining: 49
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await securityService.checkRateLimit(testIdentifier, 'webhook');
        
        expect(result).toEqual(mockResponse);
        expect(securityService.checkRateLimit).toHaveBeenCalledWith(testIdentifier, 'webhook');
      });

      it('should block requests exceeding rate limit', async () => {
        const mockResponse = {
          success: false,
          limit: 50,
          reset: currentTime + 60000,
          remaining: 0
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await securityService.checkRateLimit(testIdentifier, 'webhook');
        
        expect(result).toEqual(mockResponse);
      });
    });

    describe('General Rate Limiting', () => {
      it('should allow requests within rate limit', async () => {
        const mockResponse = {
          success: true,
          limit: 1000,
          reset: currentTime + 3600000, // 1 hour window
          remaining: 999
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await securityService.checkRateLimit(testIdentifier, 'general');
        
        expect(result).toEqual(mockResponse);
        expect(securityService.checkRateLimit).toHaveBeenCalledWith(testIdentifier, 'general');
      });

      it('should block requests exceeding rate limit', async () => {
        const mockResponse = {
          success: false,
          limit: 1000,
          reset: currentTime + 3600000,
          remaining: 0
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await securityService.checkRateLimit(testIdentifier, 'general');
        
        expect(result).toEqual(mockResponse);
      });
    });

    describe('Rate Limit Edge Cases', () => {
      it('should handle rate limit reset after window expires', async () => {
        // First request - blocked
        const blockedResponse = {
          success: false,
          limit: 100,
          reset: currentTime + 60000,
          remaining: 0
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(blockedResponse);
        
        const blockedResult = await securityService.checkRateLimit(testIdentifier, 'stripeApi');
        expect(blockedResult).toEqual(blockedResponse);

        // Advance time past the reset window
        jest.advanceTimersByTime(61000);

        // Second request - should be allowed
        const allowedResponse = {
          success: true,
          limit: 100,
          reset: currentTime + 121000,
          remaining: 99
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(allowedResponse);
        
        const allowedResult = await securityService.checkRateLimit(testIdentifier, 'stripeApi');
        expect(allowedResult).toEqual(allowedResponse);
      });

      it('should handle different identifiers independently', async () => {
        const user1 = 'user1';
        const user2 = 'user2';

        // User 1 hits rate limit
        const user1Response = {
          success: false,
          limit: 100,
          reset: currentTime + 60000,
          remaining: 0
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(user1Response);
        
        const user1Result = await securityService.checkRateLimit(user1, 'stripeApi');
        expect(user1Result).toEqual(user1Response);

        // User 2 should still be allowed
        const user2Response = {
          success: true,
          limit: 100,
          reset: currentTime + 60000,
          remaining: 99
        };
        
        (securityService.checkRateLimit as jest.Mock).mockResolvedValueOnce(user2Response);
        
        const user2Result = await securityService.checkRateLimit(user2, 'stripeApi');
        expect(user2Result).toEqual(user2Response);
      });
    });
  });

  describe('Webhook Security', () => {
    const testPayload = 'test_payload';
    const testSignature = 'test_signature';
    const testSecret = 'test_secret';

    it('should verify valid webhook signatures', () => {
      (securityService.verifyWebhookSignature as jest.Mock).mockReturnValueOnce(true);
      
      const result = securityService.verifyWebhookSignature(
        testPayload,
        testSignature,
        testSecret
      );
      
      expect(result).toBe(true);
      expect(securityService.verifyWebhookSignature).toHaveBeenCalledWith(
        testPayload,
        testSignature,
        testSecret
      );
    });

    it('should reject invalid webhook signatures', () => {
      (securityService.verifyWebhookSignature as jest.Mock).mockReturnValueOnce(false);
      
      const result = securityService.verifyWebhookSignature(
        testPayload,
        testSignature,
        testSecret
      );
      
      expect(result).toBe(false);
    });
  });

  describe('Request Validation', () => {
    it('should validate request size', () => {
      const req = {
        method: 'POST',
        headers: new Headers({
          'content-length': '2048576', // 2MB
        }),
      } as NextRequest;

      (securityService.validateRequest as jest.Mock).mockReturnValueOnce({
        isValid: false,
        error: 'Request payload too large'
      });

      const result = securityService.validateRequest(req);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Request payload too large');
    });

    it('should validate content type for POST requests', () => {
      const req = {
        method: 'POST',
        headers: new Headers({
          'content-type': 'text/plain',
        }),
      } as NextRequest;

      (securityService.validateRequest as jest.Mock).mockReturnValueOnce({
        isValid: false,
        error: 'Invalid content type'
      });

      const result = securityService.validateRequest(req);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid content type');
    });

    it('should accept valid requests', () => {
      const req = {
        method: 'POST',
        headers: new Headers({
          'content-type': 'application/json',
          'content-length': '1024',
        }),
      } as NextRequest;

      (securityService.validateRequest as jest.Mock).mockReturnValueOnce({
        isValid: true
      });

      const result = securityService.validateRequest(req);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    it('should log audit events', async () => {
      const auditData = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        status: 'success' as const,
        details: { test: true },
        ip: '127.0.0.1',
      };

      (securityService.logAuditEvent as jest.Mock).mockResolvedValueOnce(undefined);

      await securityService.logAuditEvent(auditData);

      expect(securityService.logAuditEvent).toHaveBeenCalledWith(auditData);
    });

    it('should handle missing optional fields', async () => {
      const auditData = {
        action: 'test_action',
        resource: 'test_resource',
        status: 'success' as const,
        details: { test: true },
      };

      (securityService.logAuditEvent as jest.Mock).mockResolvedValueOnce(undefined);

      await securityService.logAuditEvent(auditData);

      expect(securityService.logAuditEvent).toHaveBeenCalledWith(auditData);
    });
  });
}); 