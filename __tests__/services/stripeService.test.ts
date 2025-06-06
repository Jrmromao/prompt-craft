import { StripeService } from '@/lib/services/stripe/stripeService';
import { stripe } from '@/lib/stripe';

jest.mock('@/lib/stripe', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
  },
}));

describe('StripeService', () => {
  const service = StripeService.getInstance();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer and return the correct shape', async () => {
      (stripe.customers.create as jest.Mock).mockResolvedValue({
        id: 'cus_test',
        email: 'test@example.com',
      });

      const result = await service.createCustomer({
        email: 'test@example.com',
        userId: 'user123',
        clerkId: 'clerk123',
      });

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user123', clerkId: 'clerk123' },
      });
      expect(result).toEqual({
        id: 'cus_test',
        email: 'test@example.com',
        metadata: { userId: 'user123', clerkId: 'clerk123' },
      });
    });
  });

  describe('createCheckoutSession', () => {
    beforeAll(() => {
      stripe.checkout = {
        sessions: {
          create: jest.fn(),
        },
      } as any;
    });

    it('should create a checkout session and return the correct shape', async () => {
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'sess_test',
        url: 'https://checkout.stripe.com/test',
        customer: 'cus_test',
        subscription: 'sub_test',
      });

      const result = await service.createCheckoutSession({
        customerId: 'cus_test',
        planId: 'plan_test',
        userId: 'user123',
        successUrl: 'https://success.url',
        cancelUrl: 'https://cancel.url',
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test',
        line_items: [{ price: 'plan_test', quantity: 1 }],
        mode: 'subscription',
        success_url: 'https://success.url',
        cancel_url: 'https://cancel.url',
        metadata: { userId: 'user123', planId: 'plan_test' },
      });
      expect(result).toEqual({
        id: 'sess_test',
        url: 'https://checkout.stripe.com/test',
        customerId: 'cus_test',
        subscriptionId: 'sub_test',
        metadata: { userId: 'user123', planId: 'plan_test' },
      });
    });
  });

  describe('createCustomer error handling', () => {
    it('should call handleError and throw when Stripe throws', async () => {
      const error = new Error('Stripe error');
      (stripe.customers.create as jest.Mock).mockRejectedValue(error);
      const handleErrorSpy = jest.spyOn(service as any, 'handleError');
      await expect(
        service.createCustomer({
          email: 'fail@example.com',
          userId: 'user123',
          clerkId: 'clerk123',
        })
      ).rejects.toThrow('Stripe error');
      expect(handleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('getSubscription', () => {
    beforeAll(() => {
      stripe.subscriptions = {
        retrieve: jest.fn(),
      } as any;
    });

    it('should retrieve a subscription and return the correct shape', async () => {
      (stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue({
        id: 'sub_test',
        customer: 'cus_test',
        status: 'active',
        current_period_start: 1700000000,
        current_period_end: 1701000000,
        cancel_at_period_end: false,
        items: { data: [{ price: { id: 'plan_test' } }] },
      });

      const result = await service.getSubscription('sub_test');
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_test');
      expect(result).toEqual({
        id: 'sub_test',
        customerId: 'cus_test',
        status: 'active',
        currentPeriodStart: new Date(1700000000 * 1000),
        currentPeriodEnd: new Date(1701000000 * 1000),
        cancelAtPeriodEnd: false,
        planId: 'plan_test',
      });
    });
  });

  describe('updateSubscription', () => {
    beforeAll(() => {
      stripe.subscriptions = {
        update: jest.fn(),
      } as any;
    });

    it('should update a subscription and return the correct shape', async () => {
      (stripe.subscriptions.update as jest.Mock).mockResolvedValue({
        id: 'sub_test',
        customer: 'cus_test',
        status: 'canceled',
        current_period_start: 1700000000,
        current_period_end: 1701000000,
        cancel_at_period_end: true,
        items: { data: [{ price: { id: 'plan_test' } }] },
      });

      const result = await service.updateSubscription({
        subscriptionId: 'sub_test',
        cancelAtPeriodEnd: true,
        prorationBehavior: 'none',
      });
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_test', {
        cancel_at_period_end: true,
        proration_behavior: 'none',
      });
      expect(result).toEqual({
        id: 'sub_test',
        customerId: 'cus_test',
        status: 'canceled',
        currentPeriodStart: new Date(1700000000 * 1000),
        currentPeriodEnd: new Date(1701000000 * 1000),
        cancelAtPeriodEnd: true,
        planId: 'plan_test',
      });
    });
  });

  describe('listPaymentMethods', () => {
    beforeAll(() => {
      stripe.paymentMethods = {
        list: jest.fn(),
      } as any;
    });

    it('should list payment methods for a customer', async () => {
      (stripe.paymentMethods.list as jest.Mock).mockResolvedValue({
        data: [{ id: 'pm_1' }, { id: 'pm_2' }],
      });
      const result = await service.listPaymentMethods('cus_test');
      expect(stripe.paymentMethods.list).toHaveBeenCalledWith({
        customer: 'cus_test',
        type: 'card',
      });
      expect(result).toEqual({ data: [{ id: 'pm_1' }, { id: 'pm_2' }] });
    });
  });

  describe('listInvoices', () => {
    beforeAll(() => {
      stripe.invoices = {
        list: jest.fn(),
      } as any;
    });

    it('should list invoices for a customer', async () => {
      (stripe.invoices.list as jest.Mock).mockResolvedValue({
        data: [{ id: 'inv_1' }, { id: 'inv_2' }],
      });
      const result = await service.listInvoices('cus_test', 2);
      expect(stripe.invoices.list).toHaveBeenCalledWith({
        customer: 'cus_test',
        limit: 2,
      });
      expect(result).toEqual({ data: [{ id: 'inv_1' }, { id: 'inv_2' }] });
    });
  });
});
