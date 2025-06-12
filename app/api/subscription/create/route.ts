// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiHandler } from '@/lib/api/baseApiHandler';
import { auth } from '@clerk/nextjs/server';
import { DatabaseService } from '@/lib/services/database/databaseService';
import { StripeService } from '@/lib/services/stripe/stripeService';
import { StripeCheckoutError } from '@/lib/services/stripe/errors';

// Input validation schema
const createSubscriptionSchema = z.object({
  plan: z.string().min(1, 'Plan is required'),
});

// Subscription handler
class CreateSubscriptionHandler extends BaseApiHandler {
  constructor() {
    super({
      requireAuth: true,
      schema: createSubscriptionSchema,
      methods: ['POST'],
    });
  }

  protected async checkAuth(req: NextRequest): Promise<{ success: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    return { success: true };
  }

  protected async process(req: NextRequest): Promise<{ url: string }> {
    const { userId } = await auth();
    const { plan } = await req.json();

    const databaseService = DatabaseService.getInstance();
    const stripeService = StripeService.getInstance();

    // Get user and plan data
    const user = await databaseService.getUserByClerkId(userId!);
    if (!user) {
      throw new Error('User not found');
    }

    const planData = await databaseService.getPlanByName(plan);
    if (!planData) {
      throw new Error('Plan not found');
    }

    // Handle Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        email: user.email,
        userId: user.id,
        clerkId: user.clerkId,
      });
      customerId = customer.id;

      await databaseService.updateUser(user.id, {
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      customerId,
      planId: planData.stripeProductId,
      priceId: planData.stripePriceId,
      userId: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/profile?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    if (!session.url) {
      throw new StripeCheckoutError('Failed to create checkout session');
    }

    return { url: session.url };
  }
}

// Create handler instance
const handler = new CreateSubscriptionHandler();

// Export route handlers
export async function POST(req: NextRequest) {
  return handler.handle(req);
}
