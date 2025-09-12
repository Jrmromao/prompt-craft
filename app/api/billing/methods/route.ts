import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.subscription.stripeCustomerId,
      type: 'card',
    });

    // Format payment method data
    const formattedMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      type: method.type,
      card: {
        brand: method.card?.brand,
        last4: method.card?.last4,
        expMonth: method.card?.exp_month,
        expYear: method.card?.exp_year,
      },
      isDefault: method.id === user.subscription!.stripeDefaultPaymentMethodId,
    }));

    return NextResponse.json({
      paymentMethods: formattedMethods,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.subscription.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(user.subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update subscription with new default payment method
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        stripeDefaultPaymentMethodId: paymentMethodId,
      },
    });

    await AuditService.getInstance().logAudit({
      action: AuditAction.PAYMENT_METHOD_ADDED,
      userId,
      resource: 'billing',
      details: { paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    // If this was the default payment method, update the subscription
    if (paymentMethodId === user.subscription.stripeDefaultPaymentMethodId) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          stripeDefaultPaymentMethodId: null,
        },
      });
    }

    await AuditService.getInstance().logAudit({
      action: AuditAction.PAYMENT_METHOD_REMOVED,
      userId,
      resource: 'billing',
      details: { paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
} 