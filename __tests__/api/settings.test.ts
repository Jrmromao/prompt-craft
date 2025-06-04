import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

// Mock the auth and clerkClient
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkClient: {
    users: {
      verifyPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      getSessions: vi.fn(),
    },
    sessions: {
      revokeSession: vi.fn(),
    },
  },
}));

describe('Settings API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Change', () => {
    it('should change password successfully', async () => {
      // Mock auth
      (auth as any).mockResolvedValue({ userId: 'test-user-id' });
      
      // Mock password verification
      (clerkClient.users.verifyPassword as any).mockResolvedValue(true);
      
      // Mock password update
      (clerkClient.users.updateUserPassword as any).mockResolvedValue(true);

      const request = new Request('http://localhost:3000/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Password updated successfully');
    });

    it('should return 401 if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });

      const request = new Request('http://localhost:3000/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 400 if current password is incorrect', async () => {
      (auth as any).mockResolvedValue({ userId: 'test-user-id' });
      (clerkClient.users.verifyPassword as any).mockRejectedValue(new Error('Invalid password'));

      const request = new Request('http://localhost:3000/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Current password is incorrect');
    });
  });

  describe('Login History', () => {
    it('should return login history successfully', async () => {
      (auth as any).mockResolvedValue({ userId: 'test-user-id' });
      
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

      (clerkClient.users.getSessions as any).mockResolvedValue(mockSessions);

      const request = new Request('http://localhost:3000/api/settings/login-history');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('id', 'session-1');
    });

    it('should return 401 if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });

      const request = new Request('http://localhost:3000/api/settings/login-history');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    it('should revoke session successfully', async () => {
      (auth as any).mockResolvedValue({ userId: 'test-user-id' });
      (clerkClient.sessions.revokeSession as any).mockResolvedValue(true);

      const request = new Request('http://localhost:3000/api/settings/sessions?sessionId=test-session-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Session revoked successfully');
    });

    it('should return 400 if session ID is missing', async () => {
      (auth as any).mockResolvedValue({ userId: 'test-user-id' });

      const request = new Request('http://localhost:3000/api/settings/sessions', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Session ID is required');
    });

    it('should return 401 if user is not authenticated', async () => {
      (auth as any).mockResolvedValue({ userId: null });

      const request = new Request('http://localhost:3000/api/settings/sessions?sessionId=test-session-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(401);
    });
  });
}); 