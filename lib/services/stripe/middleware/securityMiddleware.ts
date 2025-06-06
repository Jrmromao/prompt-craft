import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityService } from '@/lib/services/security/securityService';

export async function stripeSecurityMiddleware(req: NextRequest) {
  const securityService = SecurityService.getInstance();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userId = req.headers.get('x-user-id') || undefined;

  // 1. Validate request
  const validationResult = securityService.validateRequest(req);
  if (!validationResult.isValid) {
    await securityService.logAuditEvent({
      userId,
      action: 'REQUEST_VALIDATION',
      resource: req.url,
      status: 'failure',
      details: { error: validationResult.error },
      ip,
    });
    return new NextResponse(validationResult.error, { status: 400 });
  }

  // 2. Check rate limit
  const rateLimitResult = await securityService.checkRateLimit(
    `${ip}:${userId || 'anonymous'}`,
    'stripeApi'
  );

  if (!rateLimitResult.success) {
    await securityService.logAuditEvent({
      userId,
      action: 'RATE_LIMIT_EXCEEDED',
      resource: req.url,
      status: 'failure',
      details: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset,
      },
      ip,
    });

    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
      },
    });
  }

  // 3. Log successful request
  await securityService.logAuditEvent({
    userId,
    action: req.method,
    resource: req.url,
    status: 'success',
    details: {
      method: req.method,
      path: req.url,
      rateLimitRemaining: rateLimitResult.remaining,
    },
    ip,
  });

  return null;
} 