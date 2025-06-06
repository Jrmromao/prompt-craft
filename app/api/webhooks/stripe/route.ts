import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/stripe/webhookService';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    const webhookService = WebhookService.getInstance();
    const event = await webhookService.constructEvent(body, signature, webhookSecret);
    await webhookService.handleEvent(event);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}