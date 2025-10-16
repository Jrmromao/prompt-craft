import { POST } from '@/app/api/webhooks/clerk/route';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';

// Mock Svix
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn(),
  })),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn((key: string) => {
      const headers: Record<string, string> = {
        'svix-id': 'msg_test_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'test_signature',
      };
      return headers[key];
    }),
  })),
}));

describe('Clerk Webhook Integration', () => {
  let mockWebhook: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test_secret';
    mockWebhook = new Webhook('test');
  });

  describe('user.created', () => {
    it('should create user in database when Clerk user is created', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
          image_url: 'https://example.com/avatar.jpg',
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const response = await POST(mockRequest);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clerkId: 'user_clerk_123',
          email: 'test@example.com',
          name: 'John Doe',
          imageUrl: 'https://example.com/avatar.jpg',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should handle missing name gracefully', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: null,
          last_name: null,
          image_url: null,
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      await POST(mockRequest);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'User', // Default name
          imageUrl: null,
        }),
      });
    });

    it('should not fail if user already exists', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
          image_url: null,
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const error = new Error('Unique constraint failed');
      (prisma.user.create as jest.Mock).mockRejectedValue(error);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const response = await POST(mockRequest);

      // Should succeed even if user exists
      expect(response.status).toBe(200);
    });
  });

  describe('user.updated', () => {
    it('should update user in database when Clerk user is updated', async () => {
      const mockEvent = {
        type: 'user.updated',
        data: {
          id: 'user_clerk_123',
          email_addresses: [{ email_address: 'newemail@example.com' }],
          first_name: 'Jane',
          last_name: 'Smith',
          image_url: 'https://example.com/new-avatar.jpg',
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const response = await POST(mockRequest);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'user_clerk_123' },
        data: {
          email: 'newemail@example.com',
          name: 'Jane Smith',
          imageUrl: 'https://example.com/new-avatar.jpg',
        },
      });

      expect(response.status).toBe(200);
    });

    it('should return 500 if update fails', async () => {
      const mockEvent = {
        type: 'user.updated',
        data: {
          id: 'user_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
          image_url: null,
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
    });
  });

  describe('user.deleted', () => {
    it('should delete user from database when Clerk user is deleted', async () => {
      const mockEvent = {
        type: 'user.deleted',
        data: {
          id: 'user_clerk_123',
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const response = await POST(mockRequest);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { clerkId: 'user_clerk_123' },
      });

      expect(response.status).toBe(200);
    });

    it('should not fail if user does not exist', async () => {
      const mockEvent = {
        type: 'user.deleted',
        data: {
          id: 'user_clerk_123',
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const error = new Error('Record to delete does not exist');
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const response = await POST(mockRequest);

      // Should succeed even if user doesn't exist
      expect(response.status).toBe(200);
    });
  });

  describe('webhook signature verification', () => {
    it('should reject webhooks with missing headers', async () => {
      const { headers } = require('next/headers');
      headers.mockReturnValue({
        get: jest.fn(() => null), // Missing headers
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Missing svix headers');
    });

    it('should reject webhooks with invalid signature', async () => {
      mockWebhook.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid signature');
    });

    it('should throw error if CLERK_WEBHOOK_SECRET is missing', async () => {
      delete process.env.CLERK_WEBHOOK_SECRET;

      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      await expect(POST(mockRequest)).rejects.toThrow('Please add CLERK_WEBHOOK_SECRET to .env');
    });
  });

  describe('user creation flow', () => {
    it('should create user with all fields populated', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_clerk_abc',
          email_addresses: [{ email_address: 'complete@example.com' }],
          first_name: 'Complete',
          last_name: 'User',
          image_url: 'https://example.com/complete.jpg',
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      await POST(mockRequest);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: expect.stringMatching(/^user_\d+$/),
          clerkId: 'user_clerk_abc',
          email: 'complete@example.com',
          name: 'Complete User',
          imageUrl: 'https://example.com/complete.jpg',
        },
      });
    });

    it('should generate unique user ID', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_clerk_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'Test',
          last_name: 'User',
          image_url: null,
        },
      };

      mockWebhook.verify.mockReturnValue(mockEvent);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      await POST(mockRequest);

      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.id).toMatch(/^user_\d+$/);
    });
  });
});
