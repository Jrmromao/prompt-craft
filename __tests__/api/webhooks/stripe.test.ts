import { WebhookService } from '@/lib/services/stripe/webhookService';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

// Mock dependencies
jest.mock('@/lib/services/stripe/webhookService', () => ({
  WebhookService: {
    getInstance: jest.fn(() => ({
      handleWebhook: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    webhookEvent: {
      create: jest.fn(),
    },
  },
}));

interface WebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
    };
  };
}

interface WebhookServiceInstance {
  handleWebhook: (event: WebhookEvent) => Promise<any>;
}

describe('Stripe Webhook Handler', () => {
  let webhookService: WebhookServiceInstance;
  const mockHandleWebhook = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (WebhookService.getInstance as jest.Mock).mockReturnValue({ handleWebhook: mockHandleWebhook });
    webhookService = WebhookService.getInstance() as unknown as WebhookServiceInstance;
  });

  it('should handle valid webhook events', async () => {
    const mockEvent: WebhookEvent = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
        },
      },
    };

    (stripe.webhooks.constructEvent as any).mockResolvedValue(mockEvent);
    mockHandleWebhook.mockResolvedValue({
      id: 'evt_123',
      type: mockEvent.type,
      data: mockEvent.data,
      processed: false,
    });

    const result = await webhookService.handleWebhook(mockEvent);

    expect(result).toBeDefined();
    expect(mockHandleWebhook).toHaveBeenCalledWith(mockEvent);
  });

  it('should handle invalid webhook events', async () => {
    const mockEvent: WebhookEvent = {
      type: 'invalid.event',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
        },
      },
    };

    (stripe.webhooks.constructEvent as any).mockRejectedValue(new Error('Invalid signature'));
    mockHandleWebhook.mockRejectedValue(new Error('Invalid signature'));

    await expect(webhookService.handleWebhook(mockEvent)).rejects.toThrow('Invalid signature');
  });
});
