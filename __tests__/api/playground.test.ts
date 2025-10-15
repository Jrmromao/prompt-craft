import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { POST as checkHandler } from '@/app/api/playground/check/route';
import { POST as trackHandler } from '@/app/api/playground/track/route';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    playgroundRun: {
      count: jest.fn(),
      create: jest.fn(),
    },
    prompt: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/planLimitsService', () => ({
  PlanLimitsService: {
    getInstance: jest.fn(() => ({
      isFeatureAvailable: jest.fn(),
      getFeatureDescription: jest.fn(),
      checkLimit: jest.fn(),
    })),
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper to create mock request
const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
};

describe.skip('/api/playground/check', () => {
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { PlanLimitsService } = require('@/lib/services/planLimitsService');
    mockService = PlanLimitsService.getInstance();
  });

  it('returns 401 for unauthenticated users', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const request = createMockRequest({});
    const response = await checkHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 for non-existent user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const request = createMockRequest({});
    const response = await checkHandler(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('allows access for pro users', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123',
      planType: 'PRO',
    } as any);

    mockService.isFeatureAvailable.mockResolvedValue(true);
    mockService.checkLimit.mockResolvedValue({
      allowed: true,
      limit: null,
      remaining: null,
    });

    mockPrisma.playgroundRun.count.mockResolvedValue(5);

    const request = createMockRequest({});
    const response = await checkHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('blocks access when limit exceeded', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123',
      planType: 'LITE',
    } as any);

    mockService.isFeatureAvailable.mockResolvedValue(true);
    mockService.checkLimit.mockResolvedValue({
      allowed: false,
      limit: 300,
      remaining: 0,
    });

    mockPrisma.playgroundRun.count.mockResolvedValue(300);

    const request = createMockRequest({});
    const response = await checkHandler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('300');
  });
});

describe.skip('/api/playground/track', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks playground usage successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123',
    } as any);
    mockPrisma.playgroundRun.create.mockResolvedValue({} as any);

    const request = createMockRequest({ promptId: 'prompt123' });
    const response = await trackHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.playgroundRun.create).toHaveBeenCalledWith({
      data: {
        userId: 'user123',
        promptId: 'prompt123',
        input: '',
        output: null,
      },
    });
  });

  it('increments prompt usage count', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123',
    } as any);
    mockPrisma.playgroundRun.create.mockResolvedValue({} as any);
    mockPrisma.prompt.update.mockResolvedValue({} as any);

    const request = createMockRequest({ promptId: 'prompt123' });
    await trackHandler(request);

    expect(mockPrisma.prompt.update).toHaveBeenCalledWith({
      where: { id: 'prompt123' },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  });

  it('handles missing promptId', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123',
    } as any);
    mockPrisma.playgroundRun.create.mockResolvedValue({} as any);

    const request = createMockRequest({});
    const response = await trackHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.playgroundRun.create).toHaveBeenCalledWith({
      data: {
        userId: 'user123',
        promptId: null,
        input: '',
        output: null,
      },
    });
  });
});
