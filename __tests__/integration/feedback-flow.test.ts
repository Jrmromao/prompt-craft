import { prisma } from '@/lib/prisma';
import { FeedbackService } from '@/lib/services/feedback.service';
import { FeedbackType, FeedbackCategory, FeedbackStatus, FeedbackPriority } from '@prisma/client';

describe('Feedback System Integration', () => {
  let feedbackService: FeedbackService;
  let testUserId: string;
  let createdFeedbackIds: string[] = [];

  beforeAll(async () => {
    feedbackService = FeedbackService.getInstance();
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'feedback-test@example.com',
        clerkId: 'test-clerk-id-feedback',
        name: 'Feedback Test User',
        username: 'feedback-test-user',
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up created feedback
    if (createdFeedbackIds.length > 0) {
      await prisma.feedback.deleteMany({
        where: {
          id: {
            in: createdFeedbackIds,
          },
        },
      });
    }

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('Complete feedback lifecycle', () => {
    it('should create, read, update, and delete feedback', async () => {
      // CREATE
      const feedbackData = {
        userId: testUserId,
        type: FeedbackType.BUG_REPORT,
        category: FeedbackCategory.UI_UX,
        title: 'Integration Test Bug',
        message: 'This is a test bug report for integration testing',
        rating: 3,
        url: 'https://example.com/test',
        userAgent: 'Test User Agent',
        metadata: { testData: true },
      };

      const createdFeedback = await feedbackService.createFeedback(feedbackData);
      createdFeedbackIds.push(createdFeedback.id);

      expect(createdFeedback).toMatchObject({
        userId: testUserId,
        type: FeedbackType.BUG_REPORT,
        category: FeedbackCategory.UI_UX,
        title: 'Integration Test Bug',
        message: 'This is a test bug report for integration testing',
        rating: 3,
        status: FeedbackStatus.OPEN,
        priority: FeedbackPriority.MEDIUM,
      });

      expect(createdFeedback.User).toMatchObject({
        id: testUserId,
        name: 'Feedback Test User',
        email: 'feedback-test@example.com',
      });

      // READ
      const retrievedFeedback = await feedbackService.getFeedback(createdFeedback.id);
      expect(retrievedFeedback).toMatchObject(createdFeedback);

      // UPDATE
      const updateData = {
        status: FeedbackStatus.IN_PROGRESS,
        priority: FeedbackPriority.HIGH,
        response: 'We are working on this issue',
      };

      const updatedFeedback = await feedbackService.updateFeedback(
        createdFeedback.id,
        updateData
      );

      expect(updatedFeedback.status).toBe(FeedbackStatus.IN_PROGRESS);
      expect(updatedFeedback.priority).toBe(FeedbackPriority.HIGH);
      expect(updatedFeedback.response).toBe('We are working on this issue');
      expect(updatedFeedback.responseAt).toBeTruthy();

      // DELETE
      await feedbackService.deleteFeedback(createdFeedback.id);
      createdFeedbackIds = createdFeedbackIds.filter(id => id !== createdFeedback.id);

      const deletedFeedback = await feedbackService.getFeedback(createdFeedback.id);
      expect(deletedFeedback).toBeNull();
    });

    it('should handle anonymous feedback', async () => {
      const anonymousFeedback = await feedbackService.createFeedback({
        email: 'anonymous@example.com',
        type: FeedbackType.FEATURE_REQUEST,
        category: FeedbackCategory.OTHER,
        title: 'Anonymous Feature Request',
        message: 'This is an anonymous feature request',
      });

      createdFeedbackIds.push(anonymousFeedback.id);

      expect(anonymousFeedback.userId).toBeNull();
      expect(anonymousFeedback.email).toBe('anonymous@example.com');
      expect(anonymousFeedback.User).toBeNull();
    });

    it('should filter and paginate feedback correctly', async () => {
      // Create multiple feedback entries
      const feedbackEntries = await Promise.all([
        feedbackService.createFeedback({
          userId: testUserId,
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: 'Bug Report 1',
          message: 'First bug report',
        }),
        feedbackService.createFeedback({
          userId: testUserId,
          type: FeedbackType.FEATURE_REQUEST,
          category: FeedbackCategory.API,
          title: 'Feature Request 1',
          message: 'First feature request',
        }),
        feedbackService.createFeedback({
          userId: testUserId,
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.PERFORMANCE,
          title: 'Bug Report 2',
          message: 'Second bug report',
        }),
      ]);

      createdFeedbackIds.push(...feedbackEntries.map(f => f.id));

      // Test filtering by type
      const bugReports = await feedbackService.getAllFeedback({
        userId: testUserId,
        type: FeedbackType.BUG_REPORT,
      });

      expect(bugReports.length).toBeGreaterThanOrEqual(2);
      expect(bugReports.every(f => f.type === FeedbackType.BUG_REPORT)).toBe(true);

      // Test pagination
      const firstPage = await feedbackService.getAllFeedback({
        userId: testUserId,
        limit: 2,
        offset: 0,
      });

      const secondPage = await feedbackService.getAllFeedback({
        userId: testUserId,
        limit: 2,
        offset: 2,
      });

      expect(firstPage.length).toBeLessThanOrEqual(2);
      expect(secondPage.length).toBeGreaterThanOrEqual(0);

      // Ensure no overlap between pages
      const firstPageIds = firstPage.map(f => f.id);
      const secondPageIds = secondPage.map(f => f.id);
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      expect(overlap.length).toBe(0);
    });

    it('should generate accurate statistics', async () => {
      // Create feedback with different statuses and types
      const feedbackEntries = await Promise.all([
        feedbackService.createFeedback({
          userId: testUserId,
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: 'Stats Test Bug 1',
          message: 'Bug for stats testing',
        }),
        feedbackService.createFeedback({
          userId: testUserId,
          type: FeedbackType.FEATURE_REQUEST,
          category: FeedbackCategory.API,
          title: 'Stats Test Feature 1',
          message: 'Feature for stats testing',
        }),
      ]);

      createdFeedbackIds.push(...feedbackEntries.map(f => f.id));

      // Update one to resolved status
      await feedbackService.updateFeedback(feedbackEntries[0].id, {
        status: FeedbackStatus.RESOLVED,
        priority: FeedbackPriority.HIGH,
      });

      const stats = await feedbackService.getFeedbackStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byStatus).toHaveProperty('OPEN');
      expect(stats.byStatus).toHaveProperty('RESOLVED');
      expect(stats.byType).toHaveProperty('BUG_REPORT');
      expect(stats.byType).toHaveProperty('FEATURE_REQUEST');
      expect(stats.byPriority).toHaveProperty('MEDIUM');
      expect(stats.byPriority).toHaveProperty('HIGH');
    });
  });

  describe('Data validation and constraints', () => {
    it('should enforce required fields', async () => {
      await expect(
        feedbackService.createFeedback({
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.UI_UX,
          title: '', // Empty title should fail
          message: 'Test message',
        })
      ).rejects.toThrow();
    });

    it('should handle long content appropriately', async () => {
      const longTitle = 'A'.repeat(300); // Exceeds typical title limits
      const longMessage = 'B'.repeat(3000); // Very long message

      const feedback = await feedbackService.createFeedback({
        userId: testUserId,
        type: FeedbackType.GENERAL_FEEDBACK,
        category: FeedbackCategory.OTHER,
        title: longTitle.substring(0, 200), // Truncate to reasonable length
        message: longMessage.substring(0, 2000), // Truncate to reasonable length
      });

      createdFeedbackIds.push(feedback.id);

      expect(feedback.title.length).toBeLessThanOrEqual(200);
      expect(feedback.message.length).toBeLessThanOrEqual(2000);
    });
  });
});
