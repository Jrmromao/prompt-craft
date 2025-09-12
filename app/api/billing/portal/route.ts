import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { UserService } from '@/lib/services/UserService';

// Security headers for the response
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',  
  'X-XSS-Protection': '1; mode=block',
};

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define the portal handler
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const billingService = BillingService.getInstance();
    const portalUrl = await billingService.getPortalUrl(userId);


    // read the databaseid from the userService 
    const userService = UserService.getInstance();
    const databaseId = await userService.getDatabaseIdFromClerk(userId);

    if (!databaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Audit log for billing portal access
    await AuditService.getInstance().logAudit({
      action: AuditAction.BILLING_PORTAL_ACCESSED,
      userId: databaseId,
      resource: 'billing',
      details: { portalUrl },
    });

    // Create response with security headers
    const response = NextResponse.json({ url: portalUrl });
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });

    return response;
  } catch (error) {
    console.error('Error creating billing portal:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
    return response;
  }
}
