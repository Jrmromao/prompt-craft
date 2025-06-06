import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/stripe/webhookService';
import { stripeSecurityMiddleware } from '@/lib/services/stripe/middleware/securityMiddleware';
import { SecurityService } from '@/lib/services/security/securityService';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    // Apply security middleware
    const securityResponse = await stripeSecurityMiddleware(req as any);
    if (securityResponse) {
      return securityResponse;
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return new NextResponse('Missing stripe-signature header', { status: 400 });
    }

    // Verify webhook signature
    const securityService = SecurityService.getInstance();
    if (!securityService.verifyWebhookSignature(body, signature, webhookSecret)) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const webhookService = WebhookService.getInstance();
    const event = await webhookService.constructEvent(body, signature, webhookSecret);
    await webhookService.handleEvent(event);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}