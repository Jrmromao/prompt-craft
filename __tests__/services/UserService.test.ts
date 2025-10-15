import { UserService } from '@/lib/services/UserService';
import { ServiceError } from '@/lib/services/types';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe.skip('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = UserService.getInstance();
    jest.clearAllMocks();
  });

  describe('getOrCreateUser', () => {
    const mockClerkUser = {
      id: 'clerk_123',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      imageUrl: 'https://example.com/avatar.jpg',
    };

    it('should create or update user successfully', async () => {
      const mockUser = {
        id: 'user_123',
        clerkId: 'clerk_123',
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser as any);

      const result = await userService.getOrCreateUser(mockClerkUser);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: 'clerk_123',
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
        },
      });
    });

    it('should throw ServiceError on database failure', async () => {
      mockPrisma.user.upsert.mockRejectedValue(new Error('Database error'));

      await expect(userService.getOrCreateUser(mockClerkUser)).rejects.toThrow(ServiceError);
    });
  });

  describe('getUserByClerkId', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 'user_123', clerkId: 'clerk_123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await userService.getUserByClerkId('clerk_123');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserByClerkId('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw ServiceError on database failure', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userService.getUserByClerkId('clerk_123')).rejects.toThrow(ServiceError);
    });
  });
});
