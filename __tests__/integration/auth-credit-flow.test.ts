import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(() => ({
    users: {
      getUser: jest.fn(),
      updateUserMetadata: jest.fn(),
    }
  }))
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  }
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as any;

describe('Auth and Credit Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth User Route', () => {
    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const { GET } = await import('@/app/api/auth/user/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Not authenticated');
    });

    it('should return user data for authenticated user', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: 'db_123',
        clerkId: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        planType: 'FREE',
        monthlyCredits: 10,
        purchasedCredits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const { GET } = await import('@/app/api/auth/user/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.id).toBe(mockUserId);
      expect(data.data.user.email).toBe('test@example.com');
    });

    it('should create user if not exists in database', async () => {
      const mockUserId = 'user_123';
      const mockCreatedUser = {
        id: 'db_123',
        clerkId: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        planType: 'FREE',
        monthlyCredits: 10,
        purchasedCredits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      // Mock clerkClient
      const { clerkClient } = await import('@clerk/nextjs/server');
      const mockClerkClient = clerkClient as jest.MockedFunction<any>;
      mockClerkClient.mockResolvedValue({
        users: {
          getUser: jest.fn().mockResolvedValue({
            emailAddresses: [{ emailAddress: 'test@example.com' }],
            firstName: 'Test',
            lastName: 'User',
          }),
          updateUserMetadata: jest.fn(),
        }
      });

      const { GET } = await import('@/app/api/auth/user/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('Credit Deduction Route', () => {
    it('should require authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const { req } = createMocks({
        method: 'POST',
        body: { amount: 5, reason: 'test' },
      });

      const { POST } = await import('@/app/api/credits/deduct/route');
      const response = await POST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should deduct credits successfully', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: 'db_123',
        clerkId: mockUserId,
        monthlyCredits: 10,
        purchasedCredits: 5,
      };

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Mock transaction
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({
              monthlyCredits: 10,
              purchasedCredits: 2, // 3 deducted
            }),
          },
          creditTransaction: {
            create: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      const { req } = createMocks({
        method: 'POST',
        body: { amount: 3, reason: 'AI_GENERATION' },
      });

      const { POST } = await import('@/app/api/credits/deduct/route');
      const response = await POST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.deducted).toBe(3);
      expect(data.data.totalCredits).toBe(12);
    });

    it('should reject insufficient credits', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: 'db_123',
        clerkId: mockUserId,
        monthlyCredits: 2,
        purchasedCredits: 1,
      };

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const { req } = createMocks({
        method: 'POST',
        body: { amount: 5, reason: 'AI_GENERATION' },
      });

      const { POST } = await import('@/app/api/credits/deduct/route');
      const response = await POST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient credits');
    });
  });

  describe('AI Run Route', () => {
    it('should require authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const { req } = createMocks({
        method: 'POST',
        body: { promptId: 'prompt_123', input: 'test input' },
      });

      const { POST } = await import('@/app/api/ai/run/route');
      const response = await POST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: 'db_123',
        clerkId: mockUserId,
        role: 'USER',
        planType: 'FREE',
        monthlyCredits: 10,
        purchasedCredits: 0,
      };

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const { req } = createMocks({
        method: 'POST',
        body: { promptId: 'prompt_123' }, // Missing input
      });

      const { POST } = await import('@/app/api/ai/run/route');
      const response = await POST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Prompt ID and input are required');
    });
  });
});

describe('Credit Balance Route', () => {
  it('should return credit balance for authenticated user', async () => {
    const mockUserId = 'user_123';
    const mockUser = {
      id: 'db_123',
      clerkId: mockUserId,
      role: 'USER',
      planType: 'FREE',
      monthlyCredits: 10,
      purchasedCredits: 5,
    };

    mockAuth.mockResolvedValue({ userId: mockUserId });
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    // Mock CreditService
    jest.doMock('@/lib/services/creditService', () => ({
      CreditService: {
        getInstance: () => ({
          getCreditUsage: jest.fn().mockResolvedValue({
            used: 3,
            total: 15,
            percentage: 20,
            nextResetDate: new Date(),
          }),
        }),
      },
    }));

    const { GET } = await import('@/app/api/credits/balance/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalCredits).toBe(15);
    expect(data.data.monthlyCredits).toBe(10);
    expect(data.data.purchasedCredits).toBe(5);
  });
});
