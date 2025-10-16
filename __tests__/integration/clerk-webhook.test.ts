import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';

// Mock NextResponse
class MockNextResponse {
  status: number;
  body: string;
  
  constructor(body: string, init?: { status?: number }) {
    this.body = body;
    this.status = init?.status || 200;
  }
  
  async text() {
    return this.body;
  }
  
  async json() {
    return JSON.parse(this.body);
  }
}

jest.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

// Mock Svix
const mockVerify = jest.fn();
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: mockVerify,
  })),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
    },
  },
}));

// Mock Next.js headers
const mockHeadersGet = jest.fn((key: string) => {
  const headers: Record<string, string> = {
    'svix-id': 'msg_test_123',
    'svix-timestamp': '1234567890',
    'svix-signature': 'test_signature',
  };
  return headers[key];
});

jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: mockHeadersGet,
  })),
}));

// Import after mocks
const { POST } = require('@/app/api/webhooks/clerk/route');

describe('Clerk Webhook Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test_secret';
    (prisma.user.create as jest.Mock).mockResolvedValue({});
    (prisma.user.update as jest.Mock).mockResolvedValue({});
    (prisma.user.delete as jest.Mock).mockResolvedValue({});
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

      mockVerify.mockReturnValue(mockEvent);

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

      mockVerify.mockReturnValue(mockEvent);

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

      mockVerify.mockReturnValue(mockEvent);

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

      mockVerify.mockReturnValue(mockEvent);

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

      mockVerify.mockReturnValue(mockEvent);

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

      mockVerify.mockReturnValue(mockEvent);

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

      mockVerify.mockReturnValue(mockEvent);

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
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should throw error if CLERK_WEBHOOK_SECRET is missing', async () => {
      delete process.env.CLERK_WEBHOOK_SECRET;

      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      await expect(POST(mockRequest)).rejects.toThrow('Please add CLERK_WEBHOOK_SECRET to .env');
    });
  });

});
