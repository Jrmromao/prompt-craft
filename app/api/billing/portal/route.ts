import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';

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
async function portalHandler(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const billingService = BillingService.getInstance();
    const portalUrl = await billingService.getPortalUrl(userId);

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

// Export the handler
export { portalHandler as GET };
