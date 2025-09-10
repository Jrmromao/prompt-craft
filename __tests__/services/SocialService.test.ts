import { SocialService } from '@/lib/services/SocialService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userFollow: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    prompt: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('SocialService', () => {
  let service: SocialService;

  beforeEach(() => {
    service = SocialService.getInstance();
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should successfully follow a user', async () => {
      mockPrisma.userFollow.create.mockResolvedValue({} as any);

      const result = await service.followUser('follower1', 'following1');

      expect(result).toBe(true);
      expect(mockPrisma.userFollow.create).toHaveBeenCalledWith({
        data: { followerId: 'follower1', followingId: 'following1' }
      });
    });

    it('should prevent self-following', async () => {
      const result = await service.followUser('user1', 'user1');

      expect(result).toBe(false);
      expect(mockPrisma.userFollow.create).not.toHaveBeenCalled();
    });

    it('should handle already following error', async () => {
      mockPrisma.userFollow.create.mockRejectedValue(new Error('Unique constraint'));

      const result = await service.followUser('follower1', 'following1');

      expect(result).toBe(false);
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow a user', async () => {
      mockPrisma.userFollow.delete.mockResolvedValue({} as any);

      const result = await service.unfollowUser('follower1', 'following1');

      expect(result).toBe(true);
      expect(mockPrisma.userFollow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId: 'follower1', followingId: 'following1' }
        }
      });
    });

    it('should handle not following error', async () => {
      mockPrisma.userFollow.delete.mockRejectedValue(new Error('Record not found'));

      const result = await service.unfollowUser('follower1', 'following1');

      expect(result).toBe(false);
    });
  });

  describe('getFollowingFeed', () => {
    it('should return prompts from followed users', async () => {
      const mockPrompts = [
        {
          id: 'prompt1',
          title: 'Test Prompt',
          content: 'Test content',
          isPublic: true,
          user: {
            id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            imageUrl: 'avatar.jpg'
          },
          _count: { votes: 5, comments: 2 }
        }
      ];

      mockPrisma.prompt.findMany.mockResolvedValue(mockPrompts as any);

      const result = await service.getFollowingFeed('follower1', 10);

      expect(result).toEqual(mockPrompts);
      expect(mockPrisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            followers: {
              some: { followerId: 'follower1' }
            }
          },
          isPublic: true
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          },
          _count: {
            select: { votes: true, comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    });
  });

  describe('getSuggestedUsers', () => {
    it('should return users not followed by current user', async () => {
      const mockUsers = [
        {
          id: 'user2',
          firstName: 'Jane',
          lastName: 'Smith',
          imageUrl: 'jane.jpg',
          _count: { prompts: 10, followers: 5 }
        }
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await service.getSuggestedUsers('user1', 5);

      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          id: { not: 'user1' },
          followers: {
            none: { followerId: 'user1' }
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          _count: {
            select: { prompts: true, followers: true }
          }
        },
        orderBy: {
          followers: { _count: 'desc' }
        },
        take: 5
      });
    });
  });
});
