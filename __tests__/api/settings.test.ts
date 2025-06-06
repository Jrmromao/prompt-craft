import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { DELETE } from '@/app/api/settings/sessions/route';
import { POST } from '@/app/api/settings/password/route';
import { GET } from '@/app/api/settings/login-history/route';

// Mock the auth and clerkClient
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkClient: {
    users: {
      verifyPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      getSessions: vi.fn(),
      revokeSession: vi.fn(),
    },
  },
}));

describe('Settings API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Change', () => {
    const createPasswordRequest = (currentPassword: string, newPassword: string) =>
      new Request('http://localhost:3000/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

    it('should change password successfully', async () => {
      // Mock auth
      vi.mocked(auth).mockResolvedValue({ userId: 'test-user-id' } as any);

      // Mock password verification
      (clerkClient as any).users.verifyPassword.mockResolvedValue(true);

      // Mock password update
      (clerkClient as any).users.updateUserPassword.mockResolvedValue(true);

      const request = createPasswordRequest('oldPassword123', 'newPassword123');
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Password updated successfully');
    });

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = createPasswordRequest('oldPassword123', 'newPassword123');
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 if current password is incorrect', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'test-user-id' } as any);
      (clerkClient as any).users.verifyPassword.mockRejectedValue(new Error('Invalid password'));

      const request = createPasswordRequest('wrongPassword', 'newPassword123');
      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Current password is incorrect');
    });
  });

  describe('Login History', () => {
    const createLoginHistoryRequest = () =>
      new Request('http://localhost:3000/api/settings/login-history');

    it('should return login history successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'test-user-id' } as any);

      const mockSessions = [
        {
          id: 'session-1',
          deviceType: 'iPhone',
          browserName: 'Safari',
          location: 'New York',
          ipAddress: '192.168.1.1',
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];

      (clerkClient as any).users.getSessions.mockResolvedValue(mockSessions);

      const request = createLoginHistoryRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('id', 'session-1');
    });

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = createLoginHistoryRequest();
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    const createSessionRequest = (sessionId?: string) =>
      new Request(
        `http://localhost:3000/api/settings/sessions${sessionId ? `?sessionId=${sessionId}` : ''}`,
        { method: 'DELETE' }
      );

    it('should revoke session successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'test-user-id' } as any);
      (clerkClient as any).users.revokeSession.mockResolvedValue(true);

      const request = createSessionRequest('test-session-id');
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Session revoked successfully');
    });

    it('should return 400 if session ID is missing', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'test-user-id' } as any);

      const request = createSessionRequest();
      const response = await DELETE(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Session ID is required');
    });

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = createSessionRequest('test-session-id');
      const response = await DELETE(request);

      expect(response.status).toBe(401);
    });
  });
});
