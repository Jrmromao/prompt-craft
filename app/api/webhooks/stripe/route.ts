import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { SubscriptionStatus } from "@prisma/client";
import { CreditService } from '@/app/lib/services/creditService';
import { logAudit } from '@/app/lib/auditLogger';
import { AuditAction } from '@/app/constants/audit';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature")!;

    console.log("Received webhook request");

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Webhook event constructed:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout.session.completed:", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata,
        });
        
        if (!session.metadata?.userId) {
          console.error("No userId in session metadata");
          return NextResponse.json({ error: "No userId in session metadata" }, { status: 400 });
        }

        // Get the user from the session metadata
        const user = await prisma.user.findUnique({
          where: {
            id: session.metadata.userId,
          },
        });

        if (!user) {
          console.error("No user found for ID:", session.metadata.userId);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Handle credit purchase
        if (session.metadata.type === 'credit_purchase') {
          try {
            const amount = parseInt(session.metadata.amount);
            
            // Add credits to user's account
            await CreditService.addCredits(
              user.id,
              amount,
              'Credit purchase',
              { sessionId: session.id }
            );

            // Create a record of the purchase
            await prisma.creditPurchase.create({
              data: {
                userId: user.id,
                amount,
                price: session.amount_total! / 100, // Convert from cents
                stripeSessionId: session.id,
              },
            });

            console.log("Credit purchase processed:", {
              userId: user.id,
              amount,
              sessionId: session.id,
            });

            return NextResponse.json({ received: true });
          } catch (error) {
            console.error("Error processing credit purchase:", error);
            return NextResponse.json(
              { error: "Error processing credit purchase" },
              { status: 500 }
            );
          }
        }

        // Handle subscription purchase
        if (session.metadata.priceId) {
          // Find the plan by stripePriceId
          console.log("Looking for plan with price ID:", session.metadata.priceId);
          const plan = await prisma.plan.findFirst({
            where: {
              stripePriceId: session.metadata.priceId,
            },
          });

          if (!plan) {
            console.error("No plan found for price ID:", session.metadata.priceId);
            // Log all available plans for debugging
            const allPlans = await prisma.plan.findMany();
            console.log("Available plans:", allPlans.map(p => ({ id: p.id, name: p.name, stripePriceId: p.stripePriceId })));
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
          }

          console.log("Found plan:", plan);

          console.log("Creating subscription for user:", {
            userId: user.id,
            planId: plan.id,
            customerId: session.customer,
            subscriptionId: session.subscription,
          });

          // Create or update subscription
          const subscription = await prisma.subscription.upsert({
            where: {
              userId: user.id,
            },
            create: {
              userId: user.id,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              planId: plan.id,
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              planId: plan.id,
            },
          });

          console.log("Subscription created/updated:", subscription);
        }
        break;
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
          await logAudit({
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

        console.log("Subscription updated:", updatedSubscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Processing customer.subscription.deleted:", {
          subscriptionId: subscription.id,
        });
        
        // Update subscription status to canceled
        const updatedSubscription = await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: SubscriptionStatus.CANCELED,
          },
        });

        console.log("Subscription canceled:", updatedSubscription);
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
