import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { PLANS, PlanId } from '@/lib/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export class SubscriptionService {
  private static instance: SubscriptionService;

  static getInstance(): SubscriptionService {
    if (!this.instance) {
      this.instance = new SubscriptionService();
    }
    return this.instance;
  }

  async createCheckoutSession(userId: string, planId: PlanId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const plan = PLANS[planId];
    if (!plan) throw new Error('Invalid plan');
    if (!('priceId' in plan) || !plan.priceId) throw new Error('Plan has no priceId');

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId, planId },
    });

    return session.url;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const { userId, planId } = session.metadata!;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: planId.toUpperCase() as any,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      },
    });
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription) {
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!user) return;

    const isActive = subscription.status === 'active';
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType: isActive ? user.planType : 'FREE',
      },
    });
  }

  async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeSubscriptionId) throw new Error('No subscription found');

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);
  }

  async getUsage(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const plan = PLANS[user.planType as PlanId] || PLANS.TRIAL;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [runsCount] = await Promise.all([
      prisma.promptRun.count({
        where: { userId: user.id, createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      trackedRuns: {
        used: runsCount,
        limit: plan.limits.trackedRuns,
        percentage: plan.limits.trackedRuns === -1 ? 0 : (runsCount / plan.limits.trackedRuns) * 100,
      },
    };
  }

  async checkLimit(userId: string, type: 'trackedRuns'): Promise<boolean> {
    const usage = await this.getUsage(userId);
    const limit = usage[type].limit;
    
    if (limit === -1) return true; // unlimited
    return usage[type].used < limit;
  }
}
