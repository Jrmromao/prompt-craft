// Setup mocks
jest.mock('next/server', () => {
  const NextResponse = Object.assign(
    function (body: unknown, init?: { status?: number }) {
      return {
        status: init?.status || 200,
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(body),
      };
    },
    {
      json: jest.fn((data: unknown, init?: { status?: number }) => ({
        status: init?.status || 200,
        json: () => Promise.resolve(data),
      })),
      error: jest.fn((error: unknown) => ({
        status: 500,
        json: () => Promise.resolve({ error }),
      })),
    }
  );
  return { NextResponse };
});

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/validations/user', () => ({
  userProfileSchema: {
    parse: jest.fn(),
  },
}));

jest.mock('@/lib/error-tracking', () => ({
  trackUserFlowError: jest.fn(),
  trackUserFlowEvent: jest.fn(),
}));

import { GET, PATCH } from '@/app/api/profile/route';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { userProfileSchema } from '@/lib/validations/user';
import { z } from 'zod';

describe('Profile API', () => {
  const mockUser = {
    id: 'user-db-id',
    clerkId: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    imageUrl: 'https://example.com/avatar.jpg',
    planType: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user123' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
    (userProfileSchema.parse as jest.Mock).mockReturnValue(mockUser);
  });

  describe('GET /api/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const response = await GET();
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'user123' },
        select: expect.any(Object), // or the actual select object if you want to be strict
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const response = await GET();
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/profile', () => {
    it('should update user profile for authenticated user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      (userProfileSchema.parse as jest.Mock).mockReturnValue({ name: 'Updated Name' });
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const response = await PATCH(
        new Request('http://localhost:3000/api/profile', {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Name' }),
        })
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'user123' },
        data: { name: 'Updated Name' },
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      const response = await PATCH(
        new Request('http://localhost:3000/api/profile', {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Name' }),
        })
      );

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request data', async () => {
      (userProfileSchema.parse as jest.Mock).mockImplementation(() => {
        throw new z.ZodError([]);
      });

      const response = await PATCH(
        new Request('http://localhost:3000/api/profile', {
          method: 'PATCH',
          body: JSON.stringify({ invalid: 'data' }),
        })
      );

      expect(response.status).toBe(400);
    });
  });
});
