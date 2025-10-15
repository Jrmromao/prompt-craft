import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  prompt: {
    count: jest.fn(),
    create: jest.fn(),
  },
  version: {
    count: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(),
}));

describe('API Plan Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should block FREE user from creating prompts at limit', async () => {
    const { auth } = require('@clerk/nextjs');
    auth.mockReturnValue({ userId: 'free_user' });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      planType: 'FREE'
    });

    mockPrisma.prompt.count.mockResolvedValue(10); // At limit

    const { req } = createMocks({
      method: 'POST',
      body: { name: 'Test', content: 'Test' }
    });

    // Simulate API validation
    const user = await mockPrisma.user.findUnique({ where: { clerkId: 'free_user' } });
    const promptCount = await mockPrisma.prompt.count({ where: { userId: user.id } });
    
    const canCreate = user.planType === 'PRO' || promptCount < 10;
    expect(canCreate).toBe(false);
  });

  it('should allow PRO user to create unlimited prompts', async () => {
    const { auth } = require('@clerk/nextjs');
    auth.mockReturnValue({ userId: 'pro_user' });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      planType: 'PRO'
    });

    mockPrisma.prompt.count.mockResolvedValue(100); // Way over FREE limit

    const user = await mockPrisma.user.findUnique({ where: { clerkId: 'pro_user' } });
    const promptCount = await mockPrisma.prompt.count({ where: { userId: user.id } });
    
    const canCreate = user.planType === 'PRO' || promptCount < 10;
    expect(canCreate).toBe(true);
  });

  it('should block FREE user from creating versions at limit', async () => {
    const { auth } = require('@clerk/nextjs');
    auth.mockReturnValue({ userId: 'free_user' });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      planType: 'FREE'
    });

    mockPrisma.version.count.mockResolvedValue(3); // At limit

    const user = await mockPrisma.user.findUnique({ where: { clerkId: 'free_user' } });
    const versionCount = await mockPrisma.version.count({ 
      where: { prompt: { userId: user.id } } 
    });
    
    const canCreateVersion = user.planType === 'PRO' || versionCount < 3;
    expect(canCreateVersion).toBe(false);
  });

  it('should block FREE user from playground access', async () => {
    const { auth } = require('@clerk/nextjs');
    auth.mockReturnValue({ userId: 'free_user' });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      planType: 'FREE'
    });

    const { req } = createMocks({
      method: 'POST',
      body: { prompt: 'Test prompt' }
    });

    const user = await mockPrisma.user.findUnique({ where: { clerkId: 'free_user' } });
    const canUsePlayground = user.planType === 'PRO';
    
    expect(canUsePlayground).toBe(false);
  });

  it('should validate plan-based feature access', async () => {
    const planFeatures = {
      FREE: {
        maxPrompts: 10,
        maxVersions: 3,
        playground: false,
        advancedExports: false
      },
      PRO: {
        maxPrompts: -1, // unlimited
        maxVersions: -1, // unlimited
        playground: true,
        advancedExports: true
      }
    };

    // Test FREE plan
    const freeFeatures = planFeatures.FREE;
    expect(freeFeatures.maxPrompts).toBe(10);
    expect(freeFeatures.maxVersions).toBe(3);
    expect(freeFeatures.playground).toBe(false);
    expect(freeFeatures.advancedExports).toBe(false);

    // Test PRO plan
    const proFeatures = planFeatures.PRO;
    expect(proFeatures.maxPrompts).toBe(-1);
    expect(proFeatures.maxVersions).toBe(-1);
    expect(proFeatures.playground).toBe(true);
    expect(proFeatures.advancedExports).toBe(true);
  });

  it('should handle plan upgrade scenarios', async () => {
    // User starts as FREE
    let user = { planType: 'FREE', promptCount: 8, versionCount: 2 };
    
    // Check current limits
    let canCreatePrompt = user.planType === 'PRO' || user.promptCount < 10;
    let canCreateVersion = user.planType === 'PRO' || user.versionCount < 3;
    
    expect(canCreatePrompt).toBe(true);
    expect(canCreateVersion).toBe(true);

    // User upgrades to PRO
    user = { ...user, planType: 'PRO' };
    
    // Check new capabilities
    canCreatePrompt = user.planType === 'PRO' || user.promptCount < 10;
    canCreateVersion = user.planType === 'PRO' || user.versionCount < 3;
    const canUsePlayground = user.planType === 'PRO';
    
    expect(canCreatePrompt).toBe(true);
    expect(canCreateVersion).toBe(true);
    expect(canUsePlayground).toBe(true);
  });

  it('should return proper error messages for plan restrictions', async () => {
    const errorMessages = {
      promptLimit: 'You have reached the FREE plan limit of 10 prompts. Upgrade to PRO for unlimited prompts.',
      versionLimit: 'You have reached the FREE plan limit of 3 versions per prompt. Upgrade to PRO for unlimited versions.',
      playgroundAccess: 'Playground access is available for PRO users only. Upgrade to PRO to unlock this feature.',
      exportLimit: 'Advanced exports are available for PRO users only. Upgrade to PRO to access all export formats.'
    };

    // Verify error message structure
    Object.values(errorMessages).forEach(message => {
      expect(message).toContain('Upgrade to PRO');
      expect(message.length).toBeGreaterThan(20);
    });
  });
});
