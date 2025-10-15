import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/route';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe.skip('/api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue({ userId: 'user-123' });
  });

  it('searches prompts and users successfully', async () => {
    const mockPrompts = [
      {
        id: 'prompt-1',
        title: 'Test Prompt',
        description: 'A test prompt',
        tags: ['test'],
        createdAt: new Date(),
        user: {
          id: 'user-1',
          name: 'Test User',
          imageUrl: 'https://example.com/avatar.jpg',
        },
        _count: {
          likes: 5,
          uses: 10,
        },
      },
    ];

    const mockUsers = [
      {
        id: 'user-2',
        name: 'Test User 2',
        email: 'test2@example.com',
        imageUrl: 'https://example.com/avatar2.jpg',
        createdAt: new Date(),
        _count: {
          prompts: 3,
          followers: 15,
        },
      },
    ];

    mockPrisma.prompt.findMany.mockResolvedValue(mockPrompts);
    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    const request = {
      url: 'http://localhost:3000/api/search?q=test',
    } as NextRequest;
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.prompts).toHaveLength(1);
    expect(data.data.users).toHaveLength(1);
    expect(data.data.total).toBe(2);
    expect(data.query).toBe('test');
  });

  it('validates search query parameters', async () => {
    const request = {
      url: 'http://localhost:3000/api/search?q=',
    } as NextRequest;
    
    const response = await GET(request);

    expect(response.status).toBe(500); // Will fail validation and throw error
  });

  it('handles database errors gracefully', async () => {
    mockPrisma.prompt.findMany.mockRejectedValue(new Error('Database error'));

    const request = {
      url: 'http://localhost:3000/api/search?q=test',
    } as NextRequest;
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Search failed');
  });

  it('filters by search type correctly', async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([]);

    const request = {
      url: 'http://localhost:3000/api/search?q=test&type=prompts',
    } as NextRequest;
    
    await GET(request);

    expect(mockPrisma.prompt.findMany).toHaveBeenCalled();
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  });

  it('respects limit parameter', async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([]);

    const request = {
      url: 'http://localhost:3000/api/search?q=test&limit=5',
    } as NextRequest;
    
    await GET(request);

    expect(mockPrisma.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2, // Half of limit for 'all' type
      })
    );
  });

  it('calculates relevance scores correctly', async () => {
    const mockPrompts = [
      {
        id: 'prompt-1',
        title: 'test', // Exact match
        description: 'A test prompt',
        tags: [],
        createdAt: new Date(),
        user: { id: 'user-1', name: 'User', imageUrl: '' },
        _count: { likes: 0, uses: 0 },
      },
      {
        id: 'prompt-2',
        title: 'testing something', // Starts with query
        description: 'Another prompt',
        tags: [],
        createdAt: new Date(),
        user: { id: 'user-1', name: 'User', imageUrl: '' },
        _count: { likes: 0, uses: 0 },
      },
    ];

    mockPrisma.prompt.findMany.mockResolvedValue(mockPrompts);
    mockPrisma.user.findMany.mockResolvedValue([]);

    const request = {
      url: 'http://localhost:3000/api/search?q=test',
    } as NextRequest;
    
    const response = await GET(request);
    const data = await response.json();

    expect(data.data.prompts[0].relevance).toBeGreaterThan(data.data.prompts[1].relevance);
  });
});
