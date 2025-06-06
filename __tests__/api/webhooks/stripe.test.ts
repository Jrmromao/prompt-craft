import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { WebhookService } from '@/lib/services/stripe/webhookService';

// Mock the WebhookService
vi.mock('@/lib/services/stripe/webhookService', () => ({
  WebhookService: {
    getInstance: vi.fn(() => ({
      constructEvent: vi.fn((_body, _sig, _secret) => ({
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            subscription: 'sub_test',
            customer: 'cus_test',
            metadata: { userId: 'user_test', planId: 'plan_test' }
          }
        },
        created: Date.now(),
      })),
      handleEvent: vi.fn(),
    })),
  },
}));

describe('Stripe Webhook API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles checkout.session.completed event', async () => {
    // Create a mock request with proper types
    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            subscription: 'sub_test',
            customer: 'cus_test',
            metadata: { userId: 'user_test', planId: 'plan_test' }
          }
        }
      }),
    });

    // Call the route handler
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(200);

    // Verify WebhookService was called correctly
    const webhookService = WebhookService.getInstance();
    expect(webhookService.constructEvent).toHaveBeenCalledWith(
      expect.any(String),
      'test',
      expect.any(String)
    );
    expect(webhookService.handleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'checkout.session.completed',
        data: expect.objectContaining({
          object: expect.objectContaining({
            subscription: 'sub_test',
            customer: 'cus_test',
          })
        })
      })
    );
  });

  it('returns 400 when stripe signature is missing', async () => {
    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when request body is invalid', async () => {
    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: 'invalid json',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('handles webhook service errors gracefully', async () => {
    const webhookService = WebhookService.getInstance();
    vi.mocked(webhookService.constructEvent).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  // Additional edge cases
  it('returns 405 for non-POST methods', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method,
        headers: {
          'stripe-signature': 'test',
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(405);
    }
  });

  it('handles empty event type', async () => {
    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: { object: {} }
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('handles malformed event data', async () => {
    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: null
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('handles webhook service timeout', async () => {
    const webhookService = WebhookService.getInstance();
    vi.mocked(webhookService.constructEvent).mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });
    });

    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('handles concurrent webhook requests', async () => {
    const webhookService = WebhookService.getInstance();
    const requests = Array(5).fill(null).map(() => 
      new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: { object: {} }
        }),
      })
    );

    const responses = await Promise.all(requests.map(req => POST(req)));
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    expect(webhookService.constructEvent).toHaveBeenCalledTimes(5);
  });

  it('handles webhook service throwing non-Error objects', async () => {
    const webhookService = WebhookService.getInstance();
    vi.mocked(webhookService.constructEvent).mockImplementation(() => {
      throw 'String error'; // Non-Error object
    });

    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('handles webhook service returning null event', async () => {
    const webhookService = WebhookService.getInstance();
    vi.mocked(webhookService.constructEvent).mockResolvedValue({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: { object: {} },
      created: Date.now(),
    } as any);

    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('handles webhook service handleEvent throwing error', async () => {
    const webhookService = WebhookService.getInstance();
    vi.mocked(webhookService.handleEvent).mockImplementation(() => {
      throw new Error('Failed to handle event');
    });

    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
}); 