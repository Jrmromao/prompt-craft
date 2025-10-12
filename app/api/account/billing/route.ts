import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        Subscription: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For now, return mock data since we don't have real Stripe integration
    // In production, you would fetch this from Stripe API
    const mockBillingData = {
      invoices: [
        {
          id: 'in_fake123',
          amount: 2999, // $29.99 in cents
          currency: 'usd',
          status: 'paid',
          created: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
          invoice_pdf: 'https://pay.stripe.com/invoice/fake123/pdf'
        },
        {
          id: 'in_fake124',
          amount: 2999,
          currency: 'usd', 
          status: 'paid',
          created: Math.floor(Date.now() / 1000) - 86400 * 60, // 60 days ago
          invoice_pdf: 'https://pay.stripe.com/invoice/fake124/pdf'
        }
      ],
      paymentMethods: [
        {
          id: 'pm_fake123',
          type: 'card',
          last4: '4242',
          brand: 'visa'
        }
      ],
      nextPayment: user.Subscription ? {
        amount: 2999,
        date: new Date(user.Subscription.currentPeriodEnd).toLocaleDateString()
      } : null
    };

    // TODO: Replace with real Stripe API calls
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    // const invoices = await stripe.invoices.list({ customer: customer.id });
    // const paymentMethods = await stripe.paymentMethods.list({ customer: customer.id, type: 'card' });

    return NextResponse.json(mockBillingData);
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
