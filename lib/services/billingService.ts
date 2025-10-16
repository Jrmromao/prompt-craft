import * as Sentry from '@sentry/nextjs';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

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
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user) {
        this.logger.error('User not found', { userId });
        throw new Error('User not found');
      }
      
      // Create Stripe customer if one doesn't exist
      if (!user.stripeCustomerId) {
        this.logger.info('No Stripe customer ID found, creating one', { userId });
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
            clerkId: userId,
          },
        });

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customer.id },
        });

        user.stripeCustomerId = customer.id;
      }

      this.logger.info('Found Stripe customer ID', { 
        userId, 
        stripeCustomerId: user.stripeCustomerId 
      });

      // Fetch subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });
      const subscription = subscriptions.data[0] || null;

      this.logger.info('Fetched subscriptions', { 
        userId,
        hasSubscription: !!subscription,
        subscriptionId: subscription?.id
      });

      // Fetch invoices from Stripe
      const stripeInvoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      this.logger.info('Fetched Stripe invoices', { 
        userId,
        invoiceCount: stripeInvoices.data.length,
        invoiceIds: stripeInvoices.data.map((inv: any) => inv.id)
      });

      // Format Stripe invoices
      const formattedInvoices = stripeInvoices.data.map((invoice: any) => ({
        id: invoice.id,
        amount: (invoice.amount_paid / 100).toFixed(2),
        date: new Date(invoice.created * 1000).toISOString(),
        url: invoice.hosted_invoice_url,
        status: invoice.status,
        type: 'subscription',
      }));

      // Fetch credit purchases
      const creditPurchases = await prisma.creditPurchase.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      this.logger.info('Fetched credit purchases', { 
        userId,
        purchaseCount: creditPurchases.length,
        purchaseIds: creditPurchases.map(p => p.id)
      });

      // Format credit purchases
      const formattedCreditPurchases = creditPurchases.map(purchase => ({
        id: purchase.id,
        amount: purchase.price.toFixed(2),
        date: purchase.createdAt.toISOString(),
        url: null,
        status: 'paid',
        type: 'credit_purchase',
      }));

      // Combine and sort all transactions
      const allTransactions = [...formattedInvoices, ...formattedCreditPurchases]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      this.logger.info('Combined transactions', { 
        userId,
        totalTransactions: allTransactions.length,
        transactionTypes: allTransactions.map(t => t.type)
      });

      // Fetch payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      this.logger.debug(this.logger.fmt`Retrieved ${allTransactions.length} transactions for user: ${userId}`);
      return {
        subscription,
        invoices: allTransactions,
        paymentMethods: paymentMethods.data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch billing overview', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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
      include: { Subscription: true }
    });
    
    if (!user || !user.stripeCustomerId) {
      throw new Error('No Stripe customer');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/account?tab=billing',
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
