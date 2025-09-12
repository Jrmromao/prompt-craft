import { test, expect } from '@playwright/test';

test.describe('Prompt Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('user can create and publish a prompt', async ({ page }) => {
    // Navigate to create prompt
    await page.click('[data-testid="create-prompt-button"]');
    await expect(page).toHaveURL('/prompts/create');

    // Fill in prompt details
    await page.fill('[data-testid="prompt-name"]', 'Test Marketing Prompt');
    await page.fill('[data-testid="prompt-description"]', 'A test prompt for marketing emails');
    await page.fill('[data-testid="prompt-content"]', 'Write a marketing email for [PRODUCT] targeting [AUDIENCE]');

    // Add tags
    await page.fill('[data-testid="prompt-tags"]', 'marketing,email,copywriting');
    await page.press('[data-testid="prompt-tags"]', 'Enter');

    // Select category
    await page.selectOption('[data-testid="prompt-category"]', 'MARKETING');

    // Test the prompt
    await page.click('[data-testid="test-prompt-button"]');
    
    // Fill test input
    await page.fill('[data-testid="test-input"]', 'PRODUCT: SaaS tool, AUDIENCE: developers');
    await page.click('[data-testid="run-test-button"]');

    // Wait for test results
    await expect(page.locator('[data-testid="test-results"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="test-output"]')).toContainText('Subject:');

    // Publish the prompt
    await page.click('[data-testid="publish-button"]');
    
    // Confirm publication
    await page.click('[data-testid="confirm-publish"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Prompt published successfully');

    // Verify redirect to prompt page
    await expect(page).toHaveURL(/\/prompts\/[a-zA-Z0-9]+/);
    await expect(page.locator('h1')).toContainText('Test Marketing Prompt');
  });

  test('user can save prompt as draft', async ({ page }) => {
    await page.click('[data-testid="create-prompt-button"]');

    // Fill minimal details
    await page.fill('[data-testid="prompt-name"]', 'Draft Prompt');
    await page.fill('[data-testid="prompt-content"]', 'This is a draft prompt');

    // Save as draft
    await page.click('[data-testid="save-draft-button"]');

    // Verify draft saved
    await expect(page.locator('[data-testid="draft-saved-indicator"]')).toBeVisible();
    
    // Navigate away and back
    await page.goto('/dashboard');
    await page.click('[data-testid="drafts-tab"]');

    // Verify draft appears in drafts list
    await expect(page.locator('[data-testid="draft-item"]')).toContainText('Draft Prompt');
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="create-prompt-button"]');

    // Try to publish without required fields
    await page.click('[data-testid="publish-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="content-error"]')).toContainText('Content is required');
  });

  test('should respect plan limits', async ({ page }) => {
    // Mock user with FREE plan at limit
    await page.route('/api/user/profile', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            planType: 'FREE',
            stats: {
              promptsCreated: 5, // At FREE plan limit
            }
          }
        })
      });
    });

    await page.click('[data-testid="create-prompt-button"]');

    // Should show upgrade prompt
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toContainText('You\'ve reached your prompt limit');
  });

  test('should auto-save draft periodically', async ({ page }) => {
    await page.click('[data-testid="create-prompt-button"]');

    // Fill in content
    await page.fill('[data-testid="prompt-name"]', 'Auto-save Test');
    await page.fill('[data-testid="prompt-content"]', 'Testing auto-save functionality');

    // Wait for auto-save (should happen every 30 seconds)
    await page.waitForTimeout(31000);

    // Verify auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Draft saved');
  });
});
