import { SecurityAuditService } from '@/lib/services/SecurityAuditService';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('SecurityAuditService', () => {
  let securityService: SecurityAuditService;

  beforeEach(() => {
    securityService = SecurityAuditService.getInstance();
    jest.clearAllMocks();
  });

  describe('logSecurityEvent', () => {
    it('should log security events successfully', async () => {
      const event = {
        type: 'FAILED_LOGIN' as const,
        userId: 'user_123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: { reason: 'Invalid password' },
        severity: 'MEDIUM' as const,
      };

      mockPrisma.auditLog.create.mockResolvedValue({} as any);

      await securityService.logSecurityEvent(event);

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          action: 'FAILED_LOGIN',
          details: JSON.stringify({
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            severity: 'MEDIUM',
            reason: 'Invalid password',
          }),
          timestamp: expect.any(Date),
        },
      });
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('should detect suspicious activity with multiple failed logins', async () => {
      const mockEvents = Array(6).fill({
        action: 'FAILED_LOGIN',
        details: JSON.stringify({ ipAddress: '192.168.1.1' }),
      });

      mockPrisma.auditLog.findMany.mockResolvedValue(mockEvents as any);

      const result = await securityService.detectSuspiciousActivity('user_123', '192.168.1.1');

      expect(result).toBe(true);
    });

    it('should detect suspicious activity with multiple IP addresses', async () => {
      const mockEvents = [
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.1' }) },
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.2' }) },
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.3' }) },
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.4' }) },
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.5' }) },
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.6' }) },
      ];

      mockPrisma.auditLog.findMany.mockResolvedValue(mockEvents as any);

      const result = await securityService.detectSuspiciousActivity('user_123', '192.168.1.1');

      expect(result).toBe(true);
    });

    it('should not flag normal activity as suspicious', async () => {
      const mockEvents = [
        { action: 'LOGIN', details: JSON.stringify({ ipAddress: '192.168.1.1' }) },
        { action: 'LOGOUT', details: JSON.stringify({ ipAddress: '192.168.1.1' }) },
      ];

      mockPrisma.auditLog.findMany.mockResolvedValue(mockEvents as any);

      const result = await securityService.detectSuspiciousActivity('user_123', '192.168.1.1');

      expect(result).toBe(false);
    });
  });
});
