import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { AuditService } from '@/lib/services/auditService';

// Rate limit configurations
const RATE_LIMIT_CONFIGS = {
  STRIPE_API: { requests: 100, window: '1m' },
  WEBHOOK: { requests: 50, window: '1m' },
  GENERAL: { requests: 1000, window: '1h' },
} as const;

// Create rate limiters
const rateLimiters = {
  stripeApi: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.STRIPE_API.requests,
      RATE_LIMIT_CONFIGS.STRIPE_API.window
    ),
    analytics: true,
    prefix: 'ratelimit_stripe_api',
  }),
  webhook: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.WEBHOOK.requests,
      RATE_LIMIT_CONFIGS.WEBHOOK.window
    ),
    analytics: true,
    prefix: 'ratelimit_webhook',
  }),
  general: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.GENERAL.requests,
      RATE_LIMIT_CONFIGS.GENERAL.window
    ),
    analytics: true,
    prefix: 'ratelimit_general',
  }),
};

export class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Rate limiting methods
  public async checkRateLimit(identifier: string, type: keyof typeof rateLimiters) {
    const { success, limit, reset, remaining } = await rateLimiters[type].limit(identifier);
    return { success, limit, reset, remaining };
  }

  // Request validation
  public validateRequest(req: NextRequest): { isValid: boolean; error?: string } {
    // Validate request size
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > 1024 * 1024) {
      // 1MB limit
      return { isValid: false, error: 'Request payload too large' };
    }

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT'].includes(req.method)) {
      const contentType = req.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { isValid: false, error: 'Invalid content type' };
      }
    }

    return { isValid: true };
  }

  // Audit logging
  public async logAuditEvent(data: {
    userId?: string;
    action: string;
    resource: string;
    status: 'success' | 'failure';
    details?: Record<string, any>;
    ip?: string;
  }) {
    try {
      await AuditService.logAction({
        userId: data.userId || null,
        action: data.action,
        resource: data.resource,
        status: data.status,
        details: data.details || {},
        ipAddress: data.ip || null,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // Webhook signature verification
  public verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}
