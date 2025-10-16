import { POST } from '@/app/api/stripe/webhook/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  }));
});

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      upsert: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn(() => 'test_signature'),
  })),
}));

describe('Stripe Webhook Integration', () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = new (require('stripe'))();
  });

  describe('checkout.session.completed', () => {
    it('should create subscription when checkout completes', async () => {
      const mockSession = {
        id: 'cs_test_123',
        subscription: 'sub_test_123',
        metadata: {
          userId: 'user_123',
          planId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
        },
      };

      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        current_period_start: 1234567890,
        current_period_end: 1234567890 + 2592000,
        cancel_at_period_end: false,
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: mockSession },
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);

      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockSession)),
      } as any;

      await POST(mockRequest);

      expect(prisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_123' },
          create: expect.objectContaining({
            userId: 'user_123',
            plan: 'STARTER',
            status: 'ACTIVE',
            stripeSubscriptionId: 'sub_test_123',
          }),
        })
      );
    });

    it('should handle missing metadata gracefully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        subscription: 'sub_test_123',
        metadata: {}, // Missing userId and planId
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: mockSession },
      });

      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockSession)),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.received).toBe(true);
      expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('should update subscription status', async () => {
      const mockSubscription = {
        id: 'sub_test_123',
        status: 'active',
        current_period_start: 1234567890,
        current_period_end: 1234567890 + 2592000,
        cancel_at_period_end: false,
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: mockSubscription },
      });

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });

      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockSubscription)),
      } as any;

      await POST(mockRequest);

      expect(prisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'db_sub_123' },
          data: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should cancel subscription and downgrade to FREE', async () => {
      const mockSubscription = {
        id: 'sub_test_123',
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: mockSubscription },
      });

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });

      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockSubscription)),
      } as any;

      await POST(mockRequest);

      expect(prisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'db_sub_123' },
          data: {
            status: 'CANCELED',
            plan: 'FREE',
          },
        })
      );
    });
  });

  describe('invoice.payment_succeeded', () => {
    it('should mark subscription as ACTIVE', async () => {
      const mockInvoice = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: { object: mockInvoice },
      });

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });

      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockInvoice)),
      } as any;

      await POST(mockRequest);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: { status: 'ACTIVE' },
      });
    });
  });

  describe('invoice.payment_failed', () => {
    it('should mark subscription as PAST_DUE', async () => {
      const mockInvoice = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: mockInvoice },
      });

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        id: 'db_sub_123',
        stripeSubscriptionId: 'sub_test_123',
      });

      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockInvoice)),
      } as any;

      await POST(mockRequest);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'db_sub_123' },
        data: { status: 'PAST_DUE' },
      });
    });
  });

  describe('webhook signature verification', () => {
    it('should reject invalid signatures', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const mockRequest = {
        text: jest.fn().mockResolvedValue('{}'),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
    });
  });
});
