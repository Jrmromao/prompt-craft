import * as Sentry from '@sentry/nextjs';
import { getProfileByClerkId } from '@/app/services/profileService';
import { stripe } from '@/lib/stripe';

export class BillingService {
  private static instance: BillingService;
  private readonly logger = Sentry.logger;

  private constructor() {}

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  public async getBillingOverview(userId: string) {
    this.logger.info('Fetching billing overview', { userId });
    try {
      const user = await getProfileByClerkId(userId);
      if (!user || !user.stripeCustomerId) {
        throw new Error('No Stripe customer');
      }

      // Fetch subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });
      const subscription = subscriptions.data[0] || null;

      // Fetch invoices
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      // Fetch payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      this.logger.debug(this.logger.fmt`Retrieved ${invoices.data.length} invoices for user: ${userId}`);
      return {
        subscription,
        invoices: invoices.data,
        paymentMethods: paymentMethods.data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch billing overview', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get the Stripe billing portal URL for a user
   */
  async getPortalUrl(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    });
    
    if (!user || !user.stripeCustomerId) {
      throw new Error('No Stripe customer');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/profile?tab=billing',
      flow_data: user.subscription?.stripeSubscriptionId && user.subscription.stripeSubscriptionId !== 'pending' ? {
        type: 'subscription_cancel',
        subscription_cancel: {
          subscription: user.subscription.stripeSubscriptionId,
        },
      } : undefined,
    });

    return portalSession.url;
  }
}
