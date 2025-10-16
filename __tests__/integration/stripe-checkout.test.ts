import { POST } from '@/app/api/stripe/create-checkout/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

describe('Stripe Checkout Integration', () => {
  let mockStripe: any;
  const { auth } = require('@clerk/nextjs/server');

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = new (require('stripe'))();
  });

  describe('POST /api/stripe/create-checkout', () => {
    it('should create checkout session for authenticated user', async () => {
      auth.mockResolvedValue({ userId: 'clerk_user_123' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerkId: 'clerk_user_123',
        email: 'test@example.com',
      });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: 'price_starter',
          planId: 'price_starter',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: 'test@example.com',
          line_items: [{ price: 'price_starter', quantity: 1 }],
          mode: 'subscription',
          metadata: {
            userId: 'user_123',
            planId: 'price_starter',
          },
        })
      );

      expect(data.sessionId).toBe('cs_test_123');
      expect(data.url).toBe('https://checkout.stripe.com/test');
    });

    it('should return 401 for unauthenticated users', async () => {
      auth.mockResolvedValue({ userId: null });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: 'price_starter',
          planId: 'price_starter',
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(401);
    });

    it('should return 404 if user not found', async () => {
      auth.mockResolvedValue({ userId: 'clerk_user_123' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: 'price_starter',
          planId: 'price_starter',
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(404);
    });

    it('should include correct success and cancel URLs', async () => {
      auth.mockResolvedValue({ userId: 'clerk_user_123' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerkId: 'clerk_user_123',
        email: 'test@example.com',
      });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: 'price_pro',
          planId: 'price_pro',
        }),
      } as any;

      await POST(mockRequest);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('/settings/billing?success=true'),
          cancel_url: expect.stringContaining('/pricing'),
        })
      );
    });

    it('should handle Stripe API errors gracefully', async () => {
      auth.mockResolvedValue({ userId: 'clerk_user_123' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerkId: 'clerk_user_123',
        email: 'test@example.com',
      });

      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: 'price_starter',
          planId: 'price_starter',
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
    });
  });

  describe('Plan ID mapping', () => {
    it('should correctly map Starter plan', async () => {
      auth.mockResolvedValue({ userId: 'clerk_user_123' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerkId: 'clerk_user_123',
        email: 'test@example.com',
      });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
          planId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
        }),
      } as any;

      await POST(mockRequest);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            planId: expect.any(String),
          }),
        })
      );
    });

    it('should correctly map Pro plan', async () => {
      auth.mockResolvedValue({ userId: 'clerk_user_123' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_123',
        clerkId: 'clerk_user_123',
        email: 'test@example.com',
      });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
          planId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
        }),
      } as any;

      await POST(mockRequest);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalled();
    });
  });
});
