import { test, expect } from '@playwright/test';

test.describe('Playground Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user' }),
      });
    });

    // Mock user usage API
    await page.route('**/api/profile/usage', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planType: 'PRO',
          playgroundRunsThisMonth: 5,
        }),
      });
    });
  });

  test('should load playground page', async ({ page }) => {
    await page.goto('/playground');
    
    await expect(page.locator('h1')).toContainText('Prompt Playground');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Prompt' })).toBeVisible();
  });

  test('should show upgrade prompt for free users', async ({ page }) => {
    // Override usage API for free user
    await page.route('**/api/profile/usage', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planType: 'FREE',
          playgroundRunsThisMonth: 0,
        }),
      });
    });

    await page.goto('/playground');
    
    await expect(page.locator('text=Upgrade Required')).toBeVisible();
    await expect(page.locator('text=exclusively for paid members')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Pricing Plans' })).toBeVisible();
  });

  test('should run prompt successfully', async ({ page }) => {
    // Mock playground check API
    await page.route('**/api/playground/check', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock AI run API
    await page.route('**/api/ai/run', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: 'AI generated response' }),
      });
    });

    // Mock tracking API
    await page.route('**/api/playground/track', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/playground');
    
    // Fill in prompt
    await page.fill('textarea', 'Write a short story about a robot');
    
    // Click run button
    await page.click('button:has-text("Run Prompt")');
    
    // Wait for loading state
    await expect(page.locator('text=Running...')).toBeVisible();
    
    // Wait for result
    await expect(page.locator('text=AI generated response')).toBeVisible();
    
    // Check that output tab is now enabled
    await page.click('button:has-text("Output")');
    await expect(page.locator('text=AI generated response')).toBeVisible();
  });

  test('should handle insufficient credits error', async ({ page }) => {
    // Mock playground check API to return error
    await page.route('**/api/playground/check', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Insufficient credits' }),
      });
    });

    await page.goto('/playground');
    
    await page.fill('textarea', 'Test prompt');
    await page.click('button:has-text("Run Prompt")');
    
    await expect(page.locator('text=run out of credits')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Pricing Plans' })).toBeVisible();
  });

  test('should copy text to clipboard', async ({ page }) => {
    await page.goto('/playground');
    
    // Fill in some text
    await page.fill('textarea', 'Test prompt to copy');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write']);
    
    // Click copy button (first copy button in the prompt area)
    await page.click('button[aria-label="Copy"] >> nth=0');
    
    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('Test prompt to copy');
  });

  test('should show usage limits for lite users', async ({ page }) => {
    // Override usage API for lite user
    await page.route('**/api/profile/usage', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planType: 'LITE',
          playgroundRunsThisMonth: 250,
        }),
      });
    });

    await page.goto('/playground');
    
    await expect(page.locator('text=LITE Plan')).toBeVisible();
    await expect(page.locator('text=(250/300 runs)')).toBeVisible();
  });

  test('should disable run button when over limit', async ({ page }) => {
    // Override usage API for user at limit
    await page.route('**/api/profile/usage', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planType: 'LITE',
          playgroundRunsThisMonth: 300,
        }),
      });
    });

    await page.goto('/playground');
    
    const runButton = page.getByRole('button', { name: 'Upgrade for more runs' });
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeDisabled();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/playground/check', (route) => {
      route.abort('failed');
    });

    await page.goto('/playground');
    
    await page.fill('textarea', 'Test prompt');
    await page.click('button:has-text("Run Prompt")');
    
    // Should show some error state (exact message may vary)
    await expect(page.locator('[role="alert"], .error, text=error')).toBeVisible();
  });
});
