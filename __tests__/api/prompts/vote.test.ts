// Mock all dependencies before imports
const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));

const mockHeaders = jest.fn();
jest.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Mock rate limiting
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({ success: true })
  }))
}));

jest.mock('@/lib/redis', () => ({
  redis: {}
}));

const mockPrisma = {
  user: { findUnique: jest.fn() },
  prompt: { findUnique: jest.fn(), update: jest.fn() },
  vote: { findUnique: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
  $transaction: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      constructor(message: string, code: string) {
        super(message);
        this.code = code;
      }
      code: string;
    },
  },
}));

const mockVoteRewardService = {
  processVoteReward: jest.fn(),
};

jest.mock('@/lib/services/voteRewardService', () => ({
  VoteRewardService: {
    getInstance: () => mockVoteRewardService,
  },
}));

const mockCommunityService = {
  getPrompt: jest.fn(),
};

jest.mock('@/lib/services/communityService', () => ({
  CommunityService: mockCommunityService,
}));

// Mock NextResponse
const mockNextResponse = {
  json: jest.fn((data, options) => ({
    json: () => Promise.resolve(data),
    status: options?.status || 200,
  })),
};

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}));

describe.skip('Vote API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' });
    mockHeaders.mockResolvedValue({
      get: (key: string) => {
        const headers: Record<string, string> = {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0'
        };
        return headers[key] || null;
      }
    });
    
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      clerkId: 'clerk-user-123',
      plan: 'PRO',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });
    
    mockPrisma.prompt.findUnique.mockResolvedValue({
      id: 'prompt-123',
      userId: 'author-123',
      title: 'Test Prompt',
    });
    
    mockPrisma.vote.findUnique.mockResolvedValue(null);
    
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return await callback(mockPrisma);
    });
    
    mockVoteRewardService.processVoteReward.mockResolvedValue({
      success: true,
      creditsAwarded: 1,
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue({ userId: null });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      // Import and call the handler
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Vote Creation', () => {
    it('should create a new upvote successfully', async () => {
      mockPrisma.vote.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          vote: {
            upsert: jest.fn().mockResolvedValue({ 
              id: 'vote-123', 
              userId: 'user-123', 
              promptId: 'prompt-123', 
              value: 1 
            }),
            delete: jest.fn()
          },
          prompt: { 
            update: jest.fn().mockResolvedValue({}) 
          },
        };
        return await callback(tx);
      });
      mockVoteRewardService.processVoteReward.mockResolvedValue({
        creditsAwarded: 5,
        abuseDetected: false
      });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should create a new downvote successfully', async () => {
      mockPrisma.vote.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          vote: {
            upsert: jest.fn().mockResolvedValue({ 
              id: 'vote-123', 
              userId: 'user-123', 
              promptId: 'prompt-123', 
              value: -1 
            }),
            delete: jest.fn()
          },
          prompt: { 
            update: jest.fn().mockResolvedValue({}) 
          },
        };
        return await callback(tx);
      });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: -1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('Vote Updates', () => {
    beforeEach(() => {
      mockPrisma.vote.findUnique.mockResolvedValue({
        id: 'existing-vote-123',
        userId: 'user-123',
        promptId: 'prompt-123',
        value: 1,
      });
    });

    it('should update existing vote', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          vote: {
            upsert: jest.fn().mockResolvedValue({ 
              id: 'existing-vote-123', 
              userId: 'user-123', 
              promptId: 'prompt-123', 
              value: -1 
            }),
            delete: jest.fn()
          },
          prompt: { 
            update: jest.fn().mockResolvedValue({}) 
          },
        };
        return await callback(tx);
      });
      mockVoteRewardService.processVoteReward.mockResolvedValue({
        creditsAwarded: 0,
        abuseDetected: false
      });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: -1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(200);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should remove vote when clicking same value', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        // Mock the transaction to return null vote (removed)
        return { vote: null, creditsAwarded: 0 };
      });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }), // Same as existing
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Credit Rewards', () => {
    it('should award credits for upvotes', async () => {
      mockPrisma.vote.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          vote: {
            upsert: jest.fn().mockResolvedValue({ 
              id: 'vote-123', 
              userId: 'user-123', 
              promptId: 'prompt-123', 
              value: 1 
            }),
            delete: jest.fn()
          },
          prompt: { 
            update: jest.fn().mockResolvedValue({}) 
          },
        };
        return await callback(tx);
      });
      mockVoteRewardService.processVoteReward.mockResolvedValue({
        creditsAwarded: 5,
        abuseDetected: false
      });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      await POST(request, { params: { id: 'prompt-123' } });
      
      expect(mockVoteRewardService.processVoteReward).toHaveBeenCalled();
    });

    it('should not award credits for downvotes', async () => {
      mockPrisma.vote.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          vote: {
            upsert: jest.fn().mockResolvedValue({ 
              id: 'vote-123', 
              userId: 'user-123', 
              promptId: 'prompt-123', 
              value: -1 
            }),
            delete: jest.fn()
          },
          prompt: { 
            update: jest.fn().mockResolvedValue({}) 
          },
        };
        return await callback(tx);
      });
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: -1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      await POST(request, { params: { id: 'prompt-123' } });
      
      expect(mockVoteRewardService.processVoteReward).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid vote values', async () => {
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 2 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(400);
    });

    it('should reject non-numeric vote values', async () => {
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 'invalid' }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(404);
    });

    it('should handle prompt not found', async () => {
      mockPrisma.prompt.findUnique.mockResolvedValue(null);
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(404);
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));
      
      const request = new Request('http://localhost/api/prompts/prompt-123/vote', {
        method: 'POST',
        body: JSON.stringify({ value: 1 }),
        headers: { 'content-type': 'application/json' },
      });
      
      const { POST } = require('@/app/api/prompts/[id]/vote/route');
      const response = await POST(request, { params: { id: 'prompt-123' } });
      
      expect(response.status).toBe(500);
    });
  });
}); 