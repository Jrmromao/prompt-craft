let EmailService: any, emailService: any, mockSend: any;

beforeEach(() => {
  jest.resetModules();
  mockSend = jest.fn();
  jest.doMock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: mockSend }
    }))
  }));
  EmailService = require('@/lib/services/emailService').EmailService;
  emailService = EmailService.getInstance();
  jest.clearAllMocks();
});

describe('EmailService', () => {
  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const result = await emailService.sendEmail({
        email: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'PromptHive <noreply@promptcraft.ai>',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
    });

    it('should handle email sending failure', async () => {
      mockSend.mockRejectedValue(new Error('Failed to send email'));

      const result = await emailService.sendEmail({
        email: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });

    it('should validate email format', async () => {
      const result = await emailService.sendEmail({
        email: 'invalid-email',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle concurrent email sending', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const emails = [
        {
          email: 'test1@example.com',
          subject: 'Test 1',
          html: '<p>Test 1</p>',
        },
        {
          email: 'test2@example.com',
          subject: 'Test 2',
          html: '<p>Test 2</p>',
        },
      ];

      const results = await Promise.all(
        emails.map(email => emailService.sendEmail(email))
      );

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendUsageAlert', () => {
    it('should send usage alert email', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const result = await emailService.sendUsageAlert({
        email: 'test@example.com',
        feature: 'prompts',
        usage: 90,
        limit: 100,
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'PromptHive <noreply@promptcraft.ai>',
        to: 'test@example.com',
        subject: expect.stringContaining('Usage Alert'),
        html: expect.stringContaining('90%'),
      });
    });

    it('should handle email sending failure', async () => {
      mockSend.mockRejectedValue(new Error('Failed to send email'));

      const result = await emailService.sendUsageAlert({
        email: 'test@example.com',
        feature: 'prompts',
        usage: 90,
        limit: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });

    it('should handle different usage percentages', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const testCases = [
        { usage: 50, limit: 100, expectedPercentage: '50%' },
        { usage: 75, limit: 100, expectedPercentage: '75%' },
        { usage: 99, limit: 100, expectedPercentage: '99%' },
      ];

      for (const testCase of testCases) {
        const result = await emailService.sendUsageAlert({
          email: 'test@example.com',
          feature: 'prompts',
          usage: testCase.usage,
          limit: testCase.limit,
        });

        expect(result.success).toBe(true);
        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(testCase.expectedPercentage),
          })
        );
      }
    });
  });

  describe('sendPaymentFailureAlert', () => {
    it('should send payment failure alert email', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const result = await emailService.sendPaymentFailureAlert({
        email: 'test@example.com',
        error: 'Card declined',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'PromptHive <noreply@promptcraft.ai>',
        to: 'test@example.com',
        subject: 'Payment Failed - Action Required',
        html: expect.stringContaining('Card declined'),
      });
    });

    it('should handle email sending failure', async () => {
      mockSend.mockRejectedValue(new Error('Failed to send email'));

      const result = await emailService.sendPaymentFailureAlert({
        email: 'test@example.com',
        error: 'Card declined',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });

    it('should handle different error messages', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const errorMessages = [
        'Card declined',
        'Insufficient funds',
        'Invalid card number',
      ];

      for (const errorMessage of errorMessages) {
        const result = await emailService.sendPaymentFailureAlert({
          email: 'test@example.com',
          error: errorMessage,
        });

        expect(result.success).toBe(true);
        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining(errorMessage),
          })
        );
      }
    });

    it('should handle missing error message', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const result = await emailService.sendPaymentFailureAlert({
        email: 'test@example.com',
        error: '',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Unknown error'),
        })
      );
    });

    it('should validate email format', async () => {
      const result = await emailService.sendPaymentFailureAlert({
        email: 'invalid-email',
        error: 'Card declined',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendPaymentSuccessEmail', () => {
    it('should send payment success email', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const result = await emailService.sendEmail({
        email: 'test@example.com',
        subject: 'Payment Successful - PromptHive',
        html: `
          <h1>Payment Successful</h1>
          <p>Hello Test User,</p>
          <p>Your payment of 99.99 USD has been processed successfully.</p>
          <p>Thank you for your continued support!</p>
        `,
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'PromptHive <noreply@promptcraft.ai>',
        to: 'test@example.com',
        subject: 'Payment Successful - PromptHive',
        html: expect.stringContaining('Payment Successful'),
      });
    });

    it('should handle email sending failure', async () => {
      mockSend.mockRejectedValue(new Error('Failed to send email'));

      const result = await emailService.sendEmail({
        email: 'test@example.com',
        subject: 'Payment Successful - PromptHive',
        html: '<p>Test content</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send email');
    });

    it('should handle missing user name', async () => {
      mockSend.mockResolvedValue({ id: 'email123' });

      const result = await emailService.sendEmail({
        email: 'test@example.com',
        subject: 'Payment Successful - PromptHive',
        html: `
          <h1>Payment Successful</h1>
          <p>Hello there,</p>
          <p>Your payment has been processed successfully.</p>
        `,
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Hello there'),
        })
      );
    });
  });
}); 