import { POST } from '@/app/api/webhooks/stripe/route';
import { createMocks } from 'node-mocks-http';

// Mock the WebhookService
jest.mock('@/lib/services/stripe/webhookService', () => {
  return {
    WebhookService: {
      getInstance: () => ({
        constructEvent: jest.fn((_body, _sig, _secret) => ({
          id: 'evt_test',
          type: 'checkout.session.completed',
          data: { object: {
            subscription: 'sub_test',
            customer: 'cus_test',
            metadata: { userId: 'user_test', planId: 'plan_test' }
          }},
          created: Date.now(),
        })),
        handleEvent: jest.fn(),
      }),
    },
  };
});

describe('Stripe Webhook API', () => {
  it('handles checkout.session.completed event', async () => {
    // Arrange: create a mock request
    const { req } = createMocks({
      method: 'POST',
      headers: { 'stripe-signature': 'test' },
      body: '', // raw body, since the handler uses req.text()
    });

    // Act: call the route handler
    const response = await POST(req);

    // Assert: check response status
    expect(response.status).toBe(200);
  });
}); 