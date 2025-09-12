import { GET } from '@/app/api/credits/balance/route';
import { requireAuth } from '@/lib/auth-helpers';
import { CreditService } from '@/lib/services/creditService';

// Mock dependencies
jest.mock('@/lib/auth-helpers');
jest.mock('@/lib/services/creditService');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCreditService = {
  getInstance: jest.fn(),
  getCreditUsage: jest.fn(),
};

describe('/api/credits/balance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CreditService.getInstance as jest.Mock).mockReturnValue(mockCreditService);
  });

  it('should return credit balance successfully', async () => {
    const mockUser = {
      id: 'user_123',
      monthlyCredits: 100,
      purchasedCredits: 50,
      planType: 'PRO',
      role: 'USER',
    };

    const mockUsage = {
      used: 25,
      total: 150,
      percentage: 16.67,
      nextResetDate: '2025-01-01',
    };

    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCreditService.getCreditUsage.mockResolvedValue(mockUsage);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        monthlyCredits: 100,
        purchasedCredits: 50,
        totalCredits: 150,
        usage: mockUsage,
        planType: 'PRO',
        role: 'USER',
      },
    });
  });

  it('should return error when user not authenticated', async () => {
    const mockError = new Response('Unauthorized', { status: 401 });
    mockRequireAuth.mockResolvedValue({ error: mockError });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('should handle service errors gracefully', async () => {
    const mockUser = { id: 'user_123', monthlyCredits: 100, purchasedCredits: 50 };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCreditService.getCreditUsage.mockRejectedValue(new Error('Service error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch credit balance');
  });
});
