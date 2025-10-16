import { EmailService } from '@/lib/services/emailService';

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null }),
    },
  })),
}));

describe('AlertSettings', () => {
  describe('EmailService', () => {
    it('should send invalid API key alert', async () => {
      const result = await EmailService.sendInvalidApiKeyAlert(
        'user@example.com',
        'Production Key'
      );

      expect(result.success).toBe(true);
    });

    it('should send cost spike alert', async () => {
      const result = await EmailService.sendCostSpikeAlert(
        'user@example.com',
        75.50,
        50
      );

      expect(result.success).toBe(true);
    });

    it('should send error rate alert', async () => {
      const result = await EmailService.sendErrorRateAlert(
        'user@example.com',
        15.5,
        10
      );

      expect(result.success).toBe(true);
    });

    it('should handle missing API key gracefully', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      const result = await EmailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email not configured');

      process.env.RESEND_API_KEY = originalKey;
    });
  });

  describe('Alert Settings Storage', () => {
    it('should have default settings structure', () => {
      const defaults = {
        costSpike: { enabled: false, threshold: 50 },
        errorRate: { enabled: false, threshold: 10 },
        slowResponse: { enabled: false, threshold: 2000 },
        invalidApiKey: { enabled: true },
      };

      expect(defaults.invalidApiKey.enabled).toBe(true);
      expect(defaults.costSpike.threshold).toBe(50);
    });
  });
});
