import { UserService } from '@/lib/services/UserService';
import { OnboardingService } from '@/lib/services/OnboardingService';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    userOnboarding: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('User Registration Integration Flow', () => {
  let userService: UserService;
  let onboardingService: OnboardingService;

  beforeEach(() => {
    userService = UserService.getInstance();
    onboardingService = OnboardingService.getInstance();
    jest.clearAllMocks();
  });

  describe('Complete Registration Flow', () => {
    it('should complete full user registration and onboarding', async () => {
      const mockClerkUser = {
        id: 'clerk_123',
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const mockUser = {
        id: 'user_123',
        clerkId: 'clerk_123',
        name: 'John Doe',
        email: 'john@example.com',
        imageUrl: 'https://example.com/avatar.jpg',
        planType: 'FREE',
        monthlyCredits: 50,
      };

      // Mock user creation
      mockPrisma.user.upsert.mockResolvedValue(mockUser as any);

      // Step 1: Create user
      const user = await userService.getOrCreateUser(mockClerkUser);
      expect(user).toEqual(mockUser);

      // Step 2: Track profile setup
      mockPrisma.userOnboarding.upsert.mockResolvedValue({
        id: 'onboarding_1',
        userId: 'user_123',
        step: 'profile_setup',
        completed: true,
      } as any);

      await onboardingService.trackStep('user_123', 'profile_setup', true, {
        name: 'John Doe',
        bio: 'Test bio',
      });

      expect(mockPrisma.userOnboarding.upsert).toHaveBeenCalledWith({
        where: {
          userId_step: {
            userId: 'user_123',
            step: 'profile_setup',
          },
        },
        update: {
          completed: true,
          metadata: JSON.stringify({ name: 'John Doe', bio: 'Test bio' }),
          updatedAt: expect.any(Date),
        },
        create: {
          userId: 'user_123',
          step: 'profile_setup',
          completed: true,
          metadata: JSON.stringify({ name: 'John Doe', bio: 'Test bio' }),
        },
      });

      // Step 3: Track plan selection
      await onboardingService.trackStep('user_123', 'plan_selection', true, {
        selectedPlan: 'FREE',
      });

      // Step 4: Check onboarding completion
      mockPrisma.userOnboarding.count.mockResolvedValue(2); // 2 out of 3 required steps

      const isCompleted = await onboardingService.isCompleted('user_123');
      expect(isCompleted).toBe(false); // Still missing 'first_prompt' step

      // Step 5: Complete first prompt step
      await onboardingService.trackStep('user_123', 'first_prompt', true);
      mockPrisma.userOnboarding.count.mockResolvedValue(3); // All 3 steps completed

      const isNowCompleted = await onboardingService.isCompleted('user_123');
      expect(isNowCompleted).toBe(true);
    });

    it('should handle registration errors gracefully', async () => {
      const mockClerkUser = {
        id: 'clerk_invalid',
        firstName: 'Invalid',
        lastName: 'User',
        emailAddresses: [{ emailAddress: 'invalid@example.com' }],
      };

      mockPrisma.user.upsert.mockRejectedValue(new Error('Database error'));

      await expect(userService.getOrCreateUser(mockClerkUser)).rejects.toThrow('Failed to get or create user');
    });

    it('should track onboarding progress correctly', async () => {
      const userId = 'user_123';
      const mockSteps = [
        {
          step: 'profile_setup',
          completed: true,
          metadata: '{"name":"John Doe"}',
        },
        {
          step: 'plan_selection',
          completed: true,
          metadata: '{"plan":"FREE"}',
        },
        {
          step: 'first_prompt',
          completed: false,
          metadata: null,
        },
      ];

      mockPrisma.userOnboarding.findMany.mockResolvedValue(mockSteps as any);

      const progress = await onboardingService.getProgress(userId);

      expect(progress).toEqual([
        {
          step: 'profile_setup',
          completed: true,
          metadata: { name: 'John Doe' },
        },
        {
          step: 'plan_selection',
          completed: true,
          metadata: { plan: 'FREE' },
        },
        {
          step: 'first_prompt',
          completed: false,
          metadata: undefined,
        },
      ]);
    });
  });
});
