import { stripe } from '@/lib/stripe';
import { getProfileByClerkId } from '@/app/services/profileService';

export class BillingService {
  private static instance: BillingService;

  private constructor() {}

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  async getBillingOverview(userId: string) {
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
      limit: 10 
    });

    // Fetch payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    return {
      subscription,
      invoices: invoices.data,
      paymentMethods: paymentMethods.data,
    };
  }

  /**
   * Get the Stripe billing portal URL for a user
   */
  async getPortalUrl(userId: string): Promise<string> {
    const user = await getProfileByClerkId(userId);
    if (!user || !user.stripeCustomerId) {
      throw new Error('No Stripe customer');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/profile?tab=billing',
    });

    return portalSession.url;
  }
} 