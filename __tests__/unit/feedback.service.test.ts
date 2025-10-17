import { FeedbackService } from '@/lib/services/feedback.service';
import { prisma } from '@/lib/prisma';
import { FeedbackType, FeedbackCategory, FeedbackStatus, FeedbackPriority } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    feedback: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('FeedbackService', () => {
  let feedbackService: FeedbackService;

  beforeEach(() => {
    feedbackService = FeedbackService.getInstance();
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('should create feedback successfully', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        type: FeedbackType.BUG_REPORT,
        category: FeedbackCategory.UI_UX,
        title: 'Test Bug',
        message: 'This is a test bug report',
        userId: 'user-1',
        User: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      mockPrisma.feedback.create.mockResolvedValue(mockFeedback as any);

      const result = await feedbackService.createFeedback({
        type: FeedbackType.BUG_REPORT,
        category: FeedbackCategory.UI_UX,
        title: 'Test Bug',
        message: 'This is a test bug report',
        userId: 'user-1',
      });

      expect(mockPrisma.feedback.create).toHaveBeenCalledWith({
        data: {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: 'Test Bug',
          message: 'This is a test bug report',
          userId: 'user-1',
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockFeedback);
    });

    it('should create anonymous feedback', async () => {
      const mockFeedback = {
        id: 'feedback-2',
        type: FeedbackType.FEATURE_REQUEST,
        category: FeedbackCategory.OTHER,
        title: 'Feature Request',
        message: 'Please add this feature',
        email: 'anonymous@example.com',
        User: null,
      };

      mockPrisma.feedback.create.mockResolvedValue(mockFeedback as any);

      const result = await feedbackService.createFeedback({
        type: FeedbackType.FEATURE_REQUEST,
        category: FeedbackCategory.OTHER,
        title: 'Feature Request',
        message: 'Please add this feature',
        email: 'anonymous@example.com',
      });

      expect(result.email).toBe('anonymous@example.com');
      expect(result.User).toBeNull();
    });
  });

  describe('getFeedback', () => {
    it('should get feedback by id', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        title: 'Test Feedback',
        User: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      mockPrisma.feedback.findUnique.mockResolvedValue(mockFeedback as any);

      const result = await feedbackService.getFeedback('feedback-1');

      expect(mockPrisma.feedback.findUnique).toHaveBeenCalledWith({
        where: { id: 'feedback-1' },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockFeedback);
    });

    it('should return null for non-existent feedback', async () => {
      mockPrisma.feedback.findUnique.mockResolvedValue(null);

      const result = await feedbackService.getFeedback('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAllFeedback', () => {
    it('should get all feedback with default pagination', async () => {
      const mockFeedback = [
        { id: 'feedback-1', title: 'Feedback 1' },
        { id: 'feedback-2', title: 'Feedback 2' },
      ];

      mockPrisma.feedback.findMany.mockResolvedValue(mockFeedback as any);

      const result = await feedbackService.getAllFeedback();

      expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
        skip: 0,
      });

      expect(result).toEqual(mockFeedback);
    });

    it('should filter feedback by type and status', async () => {
      const mockFeedback = [{ id: 'feedback-1', type: 'BUG_REPORT', status: 'OPEN' }];

      mockPrisma.feedback.findMany.mockResolvedValue(mockFeedback as any);

      await feedbackService.getAllFeedback({
        type: FeedbackType.BUG_REPORT,
        status: FeedbackStatus.OPEN,
        limit: 10,
        offset: 5,
      });

      expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith({
        where: {
          type: FeedbackType.BUG_REPORT,
          status: FeedbackStatus.OPEN,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('updateFeedback', () => {
    it('should update feedback successfully', async () => {
      const mockUpdatedFeedback = {
        id: 'feedback-1',
        status: FeedbackStatus.RESOLVED,
        response: 'Issue has been fixed',
      };

      mockPrisma.feedback.update.mockResolvedValue(mockUpdatedFeedback as any);

      const result = await feedbackService.updateFeedback('feedback-1', {
        status: FeedbackStatus.RESOLVED,
        response: 'Issue has been fixed',
      });

      expect(mockPrisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 'feedback-1' },
        data: {
          status: FeedbackStatus.RESOLVED,
          response: 'Issue has been fixed',
          responseAt: expect.any(Date),
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockUpdatedFeedback);
    });
  });

  describe('getFeedbackStats', () => {
    it('should return feedback statistics', async () => {
      mockPrisma.feedback.count.mockResolvedValue(100);
      mockPrisma.feedback.groupBy.mockResolvedValueOnce([
        { status: FeedbackStatus.OPEN, _count: 50 },
        { status: FeedbackStatus.RESOLVED, _count: 30 },
      ] as any);
      mockPrisma.feedback.groupBy.mockResolvedValueOnce([
        { type: FeedbackType.BUG_REPORT, _count: 40 },
        { type: FeedbackType.FEATURE_REQUEST, _count: 35 },
      ] as any);
      mockPrisma.feedback.groupBy.mockResolvedValueOnce([
        { priority: FeedbackPriority.HIGH, _count: 20 },
        { priority: FeedbackPriority.MEDIUM, _count: 60 },
      ] as any);

      const result = await feedbackService.getFeedbackStats();

      expect(result).toEqual({
        total: 100,
        byStatus: {
          OPEN: 50,
          RESOLVED: 30,
        },
        byType: {
          BUG_REPORT: 40,
          FEATURE_REQUEST: 35,
        },
        byPriority: {
          HIGH: 20,
          MEDIUM: 60,
        },
      });
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = FeedbackService.getInstance();
      const instance2 = FeedbackService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
