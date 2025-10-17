import { createMocks } from 'node-mocks-http';
import { POST, GET } from '@/app/api/feedback/route';
import { FeedbackService } from '@/lib/services/feedback.service';
import { auth } from '@clerk/nextjs/server';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/services/feedback.service');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockFeedbackService = {
  createFeedback: jest.fn(),
  getAllFeedback: jest.fn(),
};

(FeedbackService.getInstance as jest.Mock).mockReturnValue(mockFeedbackService);

describe('/api/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feedback', () => {
    it('should create feedback for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });
      
      const mockFeedback = {
        id: 'feedback-1',
        type: 'BUG_REPORT',
        category: 'UI_UX',
        title: 'Test Bug',
        message: 'This is a test bug report',
        userId: 'user-1',
      };

      mockFeedbackService.createFeedback.mockResolvedValue(mockFeedback);

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'BUG_REPORT',
          category: 'UI_UX',
          title: 'Test Bug',
          message: 'This is a test bug report',
        }),
      });
      
      // Mock the json method
      req.json = jest.fn().mockResolvedValue({
        type: 'BUG_REPORT',
        category: 'UI_UX',
        title: 'Test Bug',
        message: 'This is a test bug report',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFeedback);

      expect(mockFeedbackService.createFeedback).toHaveBeenCalledWith({
        type: 'BUG_REPORT',
        category: 'UI_UX',
        title: 'Test Bug',
        message: 'This is a test bug report',
        userId: 'user-1',
        userAgent: 'test-agent',
        url: 'https://example.com/test',
      });
    });

    it('should create anonymous feedback', async () => {
      mockAuth.mockResolvedValue({ userId: null });
      
      const mockFeedback = {
        id: 'feedback-2',
        type: 'FEATURE_REQUEST',
        category: 'OTHER',
        title: 'Feature Request',
        message: 'Please add this feature',
        email: 'user@example.com',
      };

      mockFeedbackService.createFeedback.mockResolvedValue(mockFeedback);

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });
      
      req.json = jest.fn().mockResolvedValue({
        type: 'FEATURE_REQUEST',
        category: 'OTHER',
        title: 'Feature Request',
        message: 'Please add this feature',
        email: 'user@example.com',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockFeedbackService.createFeedback).toHaveBeenCalledWith({
        type: 'FEATURE_REQUEST',
        category: 'OTHER',
        title: 'Feature Request',
        message: 'Please add this feature',
        email: 'user@example.com',
        userId: undefined,
        userAgent: undefined,
        url: undefined,
      });
    });

    it('should handle empty request body', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '', // Empty body
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should handle null request body', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: null, // Null body
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('request body');
    });

    it('should handle malformed JSON', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '{ invalid json }', // Malformed JSON
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should handle missing content-type header', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });

      const { req } = createMocks({
        method: 'POST',
        // No content-type header
        body: {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: 'Test Bug',
          message: 'This is a test bug report',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      // Should still work if body is valid
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate input data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          type: 'INVALID_TYPE',
          category: FeedbackCategory.UI_UX,
          title: '',
          message: 'Test message',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid input');
    });

    it('should handle service errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });
      mockFeedbackService.createFeedback.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: 'Test Bug',
          message: 'This is a test bug report',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create feedback');
    });

    it('should log detailed error information for service errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });
      mockFeedbackService.createFeedback.mockRejectedValue(new Error('Database connection failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: 'Test Bug',
          message: 'This is a test bug report',
        },
      });

      await POST(req as any);

      expect(consoleSpy).toHaveBeenCalledWith('Feedback creation error:', expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith('Error details:', expect.objectContaining({
        message: 'Database connection failed',
        type: 'object',
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('GET /api/feedback', () => {
    it('should get user feedback', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });
      
      const mockFeedback = [
        { id: 'feedback-1', title: 'Feedback 1', userId: 'user-1' },
        { id: 'feedback-2', title: 'Feedback 2', userId: 'user-1' },
      ];

      mockFeedbackService.getAllFeedback.mockResolvedValue(mockFeedback);

      const { req } = createMocks({
        method: 'GET',
        query: {
          type: FeedbackType.BUG_REPORT,
          limit: '10',
          offset: '0',
        },
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFeedback);

      expect(mockFeedbackService.getAllFeedback).toHaveBeenCalledWith({
        userId: 'user-1',
        type: FeedbackType.BUG_REPORT,
        status: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('should require authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-1' });
      mockFeedbackService.getAllFeedback.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch feedback');
    });
  });
});
