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

// Setup global Request
global.Request = class Request {
  url: string;
  method: string;
  body: string;
  headers: Headers;

  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.body = init?.body as string || '';
    this.headers = new Headers(init?.headers);
  }

  async json() {
    return JSON.parse(this.body);
  }
} as any;

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userSettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/settingsService', () => ({
  SettingsService: {
    getUserSettings: jest.fn(),
    createDefaultSettings: jest.fn(),
    updateUserSettings: jest.fn(),
  },
}));

// Import after mocks
import { GET, PATCH } from '@/app/api/settings/[userId]/route';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { SettingsService } from '@/lib/services/settingsService';
import { NextResponse } from 'next/server';
import { z } from 'zod';

describe('Settings API', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
  };

  const mockSettings = {
    id: 'settings_123',
    userId: 'user_123',
    theme: 'system',
    notifications: true,
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as unknown as jest.Mock).mockReturnValue({ userId: mockUser.id });
  });

  describe('GET /api/settings/[userId]', () => {
    it('should return user settings for authenticated user', async () => {
      (SettingsService.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);

      const request = new Request('http://localhost:3000/api/settings/user_123');
      const response = await GET(request, { params: { userId: mockUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSettings);
    });

    it('should create default settings if none exist', async () => {
      
      (SettingsService.getUserSettings as jest.Mock).mockResolvedValue(null);
      (SettingsService.createDefaultSettings as jest.Mock).mockResolvedValue(mockSettings);

      const request = new Request('http://localhost:3000/api/settings/user_123');
      const response = await GET(request, { params: { userId: mockUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSettings);
      expect(SettingsService.createDefaultSettings).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return 401 for unauthenticated user', async () => {
      (auth as unknown as jest.Mock).mockReturnValue({ userId: null });

      const request = new Request('http://localhost:3000/api/settings/user_123');
      const response = await GET(request, { params: { userId: mockUser.id } });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/settings/[userId]', () => {
    it('should update theme settings', async () => {
      const updatedSettings = {
        ...mockSettings,
        theme: 'dark',
      };
      (SettingsService.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);
      (SettingsService.updateUserSettings as jest.Mock).mockResolvedValue(updatedSettings);

      const request = new Request('http://localhost:3000/api/settings/user_123', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark' }),
      });
      const response = await PATCH(request, { params: { userId: mockUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedSettings);
    });

    it('should update notification settings', async () => {
      const updatedSettings = {
        ...mockSettings,
        notifications: false,
      };
      (SettingsService.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);
      (SettingsService.updateUserSettings as jest.Mock).mockResolvedValue(updatedSettings);

      const request = new Request('http://localhost:3000/api/settings/user_123', {
        method: 'PATCH',
        body: JSON.stringify({ notifications: false }),
      });
      const response = await PATCH(request, { params: { userId: mockUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedSettings);
    });

    it('should update language settings', async () => {
      const updatedSettings = {
        ...mockSettings,
        language: 'es',
      };
      (SettingsService.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);
      (SettingsService.updateUserSettings as jest.Mock).mockResolvedValue(updatedSettings);

      const request = new Request('http://localhost:3000/api/settings/user_123', {
        method: 'PATCH',
        body: JSON.stringify({ language: 'es' }),
      });
      const response = await PATCH(request, { params: { userId: mockUser.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedSettings);
    });

    it('should return 401 for unauthenticated user', async () => {
      (auth as unknown as jest.Mock).mockReturnValue({ userId: null });

      const request = new Request('http://localhost:3000/api/settings/user_123', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark' }),
      });
      const response = await PATCH(request, { params: { userId: mockUser.id } });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid request data', async () => {
      const request = new Request('http://localhost:3000/api/settings/user_123', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'invalid' }),
      });
      const response = await PATCH(request, { params: { userId: mockUser.id } });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toBe('Invalid request data');
    });
  });
});

