import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/prisma';

// Test database setup
export const setupTestDatabase = async () => {
  // Create test users
  const testUsers = await Promise.all([
    prisma.user.create({
      data: {
        id: 'test-user-1',
        clerkId: 'clerk-test-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        imageUrl: 'avatar1.jpg',
        planType: 'PRO'
      }
    }),
    prisma.user.create({
      data: {
        id: 'test-user-2',
        clerkId: 'clerk-test-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        imageUrl: 'avatar2.jpg',
        planType: 'FREE'
      }
    })
  ]);

  // Create test prompts
  const testPrompts = await Promise.all([
    prisma.prompt.create({
      data: {
        id: 'test-prompt-1',
        name: 'Test Prompt 1',
        description: 'A test prompt',
        content: 'Test content',
        userId: testUsers[0].id,
        isPublic: true,
        upvotes: 100
      }
    }),
    prisma.prompt.create({
      data: {
        id: 'test-prompt-2',
        name: 'Test Prompt 2',
        description: 'Another test prompt',
        content: 'More test content',
        userId: testUsers[1].id,
        isPublic: true,
        upvotes: 50
      }
    })
  ]);

  // Create test votes
  await Promise.all([
    prisma.vote.create({
      data: {
        userId: testUsers[1].id,
        promptId: testPrompts[0].id,
        value: 1
      }
    }),
    prisma.vote.create({
      data: {
        userId: testUsers[0].id,
        promptId: testPrompts[1].id,
        value: 1
      }
    })
  ]);

  // Create test vote rewards
  await Promise.all([
    prisma.voteReward.create({
      data: {
        voteId: 'vote-1',
        voterId: testUsers[1].id,
        promptAuthorId: testUsers[0].id,
        promptId: testPrompts[0].id,
        creditsAwarded: 1,
        voterPlanType: 'FREE'
      }
    })
  ]);

  // Create test achievements
  await prisma.userAchievement.create({
    data: {
      userId: testUsers[0].id,
      achievementId: 'first_prompt',
      earnedAt: new Date()
    }
  });

  // Create test challenges
  await prisma.challenge.create({
    data: {
      id: 'test-challenge-1',
      title: 'Test Weekly Challenge',
      description: 'A test challenge',
      theme: 'Testing',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      prize: '100 test credits'
    }
  });

  // Create test follows
  await prisma.userFollow.create({
    data: {
      followerId: testUsers[1].id,
      followingId: testUsers[0].id
    }
  });

  return { testUsers, testPrompts };
};

export const cleanupTestDatabase = async () => {
  // Clean up in reverse order of dependencies
  await prisma.userFollow.deleteMany({});
  await prisma.challengeParticipant.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.voteReward.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.prompt.deleteMany({});
  await prisma.user.deleteMany({});
};

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'mock-user-1',
  firstName: 'Mock',
  lastName: 'User',
  email: 'mock@test.com',
  imageUrl: 'mock-avatar.jpg',
  planType: 'PRO',
  createdAt: new Date(),
  ...overrides
});

export const createMockPrompt = (overrides = {}) => ({
  id: 'mock-prompt-1',
  name: 'Mock Prompt',
  description: 'A mock prompt for testing',
  content: 'Mock prompt content',
  userId: 'mock-user-1',
  isPublic: true,
  upvotes: 10,
  createdAt: new Date(),
  ...overrides
});

export const createMockAchievement = (overrides = {}) => ({
  id: 'mock-achievement',
  title: 'Mock Achievement',
  description: 'A mock achievement',
  icon: '🏆',
  rarity: 'common',
  points: 10,
  earned: false,
  ...overrides
});

export const createMockChallenge = (overrides = {}) => ({
  id: 'mock-challenge',
  title: 'Mock Challenge',
  description: 'A mock challenge',
  theme: 'Testing',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  prize: '100 credits',
  participants: 0,
  status: 'active',
  ...overrides
});

// Test utilities
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
});
