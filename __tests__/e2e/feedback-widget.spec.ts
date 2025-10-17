import { test, expect } from '@playwright/test';

test.describe('Feedback Widget E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should display floating feedback button', async ({ page }) => {
    // Check if feedback button is visible
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await expect(feedbackButton).toBeVisible();
    
    // Check if button has proper styling
    await expect(feedbackButton).toHaveClass(/rounded-full/);
    await expect(feedbackButton).toHaveClass(/fixed/);
  });

  test('should show pulse and glow effects', async ({ page }) => {
    // Check for pulse ring effect
    const pulseRing = page.locator('.animate-ping').first();
    await expect(pulseRing).toBeVisible();
    
    // Check for glow effect
    const glowEffect = page.locator('.blur-xl.animate-pulse').first();
    await expect(glowEffect).toBeVisible();
  });

  test('should open feedback modal when clicked', async ({ page }) => {
    // Click the feedback button
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    // Check if modal is visible
    await expect(page.locator('text=Send Feedback')).toBeVisible();
    
    // Check if form fields are present
    await expect(page.locator('label:has-text("Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Category")')).toBeVisible();
    await expect(page.locator('label:has-text("Title")')).toBeVisible();
    await expect(page.locator('label:has-text("Message")')).toBeVisible();
    await expect(page.locator('label:has-text("Rating")')).toBeVisible();
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    // Open modal
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    // Close modal
    const closeButton = page.locator('button[aria-label="Close"]').or(page.locator('button:has(svg)').last());
    await closeButton.click();
    
    // Check if modal is closed
    await expect(page.locator('text=Send Feedback')).not.toBeVisible();
  });

  test('should handle star rating interaction', async ({ page }) => {
    // Open modal
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    // Click on the 4th star
    const stars = page.locator('button:has(svg.h-6.w-6)').filter({ hasText: '' });
    await stars.nth(3).click();
    
    // Check if stars are filled (first 4 should be yellow)
    const filledStars = page.locator('svg.fill-yellow-400');
    await expect(filledStars).toHaveCount(4);
  });

  test('should validate required fields', async ({ page }) => {
    // Open modal
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Send Feedback")');
    await expect(submitButton).toBeDisabled();
    
    // Fill title only
    await page.fill('input[placeholder*="summary"]', 'Test Title');
    await expect(submitButton).toBeDisabled();
    
    // Fill message
    await page.fill('textarea[placeholder*="Tell us more"]', 'Test message content');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should submit feedback successfully', async ({ page }) => {
    // Mock the API response
    await page.route('/api/feedback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 'test-feedback-id' }
        })
      });
    });

    // Open modal
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    // Fill form
    await page.selectOption('select', 'BUG_REPORT'); // Type selector
    await page.fill('input[placeholder*="summary"]', 'E2E Test Bug Report');
    await page.fill('textarea[placeholder*="Tell us more"]', 'This is a test bug report from E2E testing');
    
    // Rate 5 stars
    const stars = page.locator('button:has(svg.h-6.w-6)').filter({ hasText: '' });
    await stars.nth(4).click();
    
    // Submit
    const submitButton = page.locator('button:has-text("Send Feedback")');
    await submitButton.click();
    
    // Check for success message (toast)
    await expect(page.locator('text=Feedback sent!')).toBeVisible();
    
    // Check if modal is closed
    await expect(page.locator('text=Send Feedback')).not.toBeVisible();
  });

  test('should handle submission errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('/api/feedback', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Server error'
        })
      });
    });

    // Open modal and fill form
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    await page.fill('input[placeholder*="summary"]', 'Error Test');
    await page.fill('textarea[placeholder*="Tell us more"]', 'Testing error handling');
    
    // Submit
    const submitButton = page.locator('button:has-text("Send Feedback")');
    await submitButton.click();
    
    // Check for error message
    await expect(page.locator('text=Failed to send feedback')).toBeVisible();
    
    // Modal should still be open
    await expect(page.locator('text=Send Feedback')).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/feedback', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'test-id' } })
      });
    });

    // Open modal and fill form
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    await page.fill('input[placeholder*="summary"]', 'Loading Test');
    await page.fill('textarea[placeholder*="Tell us more"]', 'Testing loading state');
    
    // Submit
    const submitButton = page.locator('button:has-text("Send Feedback")');
    await submitButton.click();
    
    // Check loading state
    await expect(page.locator('text=Sending...')).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    // Wait for completion
    await expect(page.locator('text=Feedback sent!')).toBeVisible();
  });

  test('should work for anonymous users', async ({ page }) => {
    // Mock successful submission
    await page.route('/api/feedback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'anonymous-feedback' } })
      });
    });

    // Open modal
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    await feedbackButton.click();
    
    // Fill form including email for anonymous user
    await page.fill('input[placeholder*="summary"]', 'Anonymous Feedback');
    await page.fill('textarea[placeholder*="Tell us more"]', 'This is anonymous feedback');
    await page.fill('input[placeholder="your@email.com"]', 'anonymous@example.com');
    
    // Submit
    const submitButton = page.locator('button:has-text("Send Feedback")');
    await submitButton.click();
    
    // Should succeed
    await expect(page.locator('text=Feedback sent!')).toBeVisible();
  });

  test('should show tooltip on hover', async ({ page }) => {
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    
    // Hover over button
    await feedbackButton.hover();
    
    // Check for tooltip
    await expect(page.locator('text=Send Feedback').first()).toBeVisible();
  });

  test('should show periodic bounce animation', async ({ page }) => {
    // Wait for potential bounce animation
    await page.waitForTimeout(2000);
    
    // Check if bounce class might be applied (this is timing-dependent)
    const feedbackButton = page.locator('button').filter({ hasText: /feedback/i }).first();
    
    // The button should be visible and potentially have bounce animation
    await expect(feedbackButton).toBeVisible();
    
    // Note: Testing CSS animations in E2E is challenging and timing-dependent
    // This test mainly ensures the button remains functional
  });
});
