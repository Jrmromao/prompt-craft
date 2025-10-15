import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { SubscriptionStatus, CreditType } from "@prisma/client";
import { CreditService } from '@/lib/services/creditService';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;


    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.metadata?.userId) {
          console.error("No userId in session metadata");
          return NextResponse.json({ error: "No userId in session metadata" }, { status: 400 });
        }

        // Verify this is a credit purchase
        if (session.metadata.type !== 'credit_purchase') {
          return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 });
        }

        const userId = session.metadata.userId;
        const amount = parseInt(session.metadata.amount);

        if (!userId || !amount) {
          return NextResponse.json(
            { error: 'Missing user ID or amount' },
            { status: 400 }
          );
        }

        // Get the user from the session metadata
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          console.error("No user found for ID:", userId);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Handle credit purchase
        try {
          // Add credits to user's account
          await CreditService.getInstance().addCredits(
            userId,
            amount,
            CreditType.TOP_UP
          );

          // Create a record of the purchase
          await prisma.creditPurchase.create({
            data: {
              userId: userId,
              amount,
              price: session.amount_total! / 100, // Convert from cents
              stripeSessionId: session.id,
            },
          });

          // Log the successful purchase
          await AuditService.getInstance().logAudit({
            userId,
            action: AuditAction.CREDIT_PURCHASE_COMPLETED,
            resource: 'credits',
            details: {
              amount: amount.toString(),
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
            },
          });

          return NextResponse.json({ success: true });
        } catch (error) {
          console.error("Error processing credit purchase:", error);
          return NextResponse.json(
            { error: "Error processing credit purchase" },
            { status: 500 }
          );
        }
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        };
        
        // Get the user's subscription
        const userSubscription = await prisma.subscription.findFirst({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          include: {
            user: true,
          },
        });

        if (!userSubscription) {
          console.error("No subscription found for ID:", subscription.id);
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        // Check if this is a renewal (status is active and period has changed)
        const isRenewal = 
          subscription.status === 'active' && 
          userSubscription.status === SubscriptionStatus.ACTIVE &&
          new Date(subscription.current_period_start * 1000).getTime() > 
          userSubscription.currentPeriodStart.getTime();

        if (isRenewal) {
          // Log the renewal and reset of limits
          await AuditService.getInstance().logAudit({
            userId: userSubscription.userId,
            action: AuditAction.SUBSCRIPTION_RENEWED,
            resource: 'subscription',
            details: {
              subscriptionId: subscription.id,
              planId: userSubscription.planId,
              oldPeriodEnd: userSubscription.currentPeriodEnd,
              newPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
          });
        }

        // Update subscription status
        const updatedSubscription = await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: subscription.status.toUpperCase() as SubscriptionStatus,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status to canceled
        const updatedSubscription = await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: SubscriptionStatus.CANCELED,
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
