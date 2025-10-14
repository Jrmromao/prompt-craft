import { test, expect } from '@playwright/test';

test.describe('Prompt Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.goto('/');
  });

  test('complete prompt creation and version control flow', async ({ page }) => {
    // Navigate to prompt creation
    await page.goto('/prompts/create');
    
    // Fill in AI generation form
    await page.fill('[data-testid="user-idea-input"]', 'Write a professional email template');
    await page.selectOption('[data-testid="prompt-type-select"]', 'professional');
    await page.selectOption('[data-testid="tone-select"]', 'professional');
    
    // Generate prompt (mock the API response)
    await page.route('/api/prompts/optimize', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          optimizedPrompt: 'Write a professional email that is clear, concise, and actionable...',
        }),
      });
    });
    
    await page.click('[data-testid="generate-prompt-button"]');
    
    // Wait for generation to complete
    await expect(page.locator('[data-testid="prompt-content"]')).toContainText('Write a professional email');
    
    // Fill in prompt details
    await page.fill('[data-testid="prompt-name-input"]', 'Professional Email Template');
    await page.fill('[data-testid="prompt-description-input"]', 'Template for professional emails');
    
    // Mock save API
    await page.route('/api/prompts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'prompt_123',
          name: 'Professional Email Template',
          content: 'Write a professional email that is clear, concise, and actionable...',
        }),
      });
    });
    
    // Save prompt
    await page.click('[data-testid="save-prompt-button"]');
    
    // Verify success message
    await expect(page.locator('.sonner-toast')).toContainText('Prompt saved successfully');
    
    // Verify version control appears
    await expect(page.locator('[data-testid="version-control"]')).toBeVisible();
    
    // Test version creation
    await page.fill('[data-testid="prompt-content"]', 'Updated professional email template with more details...');
    
    // Mock version creation API
    await page.route('/api/prompts/prompt_123/versions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'version_123',
          content: 'Updated professional email template with more details...',
        }),
      });
    });
    
    await page.click('[data-testid="save-version-button"]');
    
    // Verify version saved
    await expect(page.locator('.sonner-toast')).toContainText('Version saved');
    
    // Test export functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Professional Email Template');
  });

  test('freemium limits enforcement', async ({ page }) => {
    await page.goto('/prompts/create');
    
    // Mock user with 10 prompts (at limit)
    await page.route('/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planType: 'FREE',
          Prompt: new Array(10).fill({ id: 'prompt' }),
        }),
      });
    });
    
    // Mock save API to return limit error
    await page.route('/api/prompts', async route => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Free plan limit reached. Upgrade to PRO for unlimited prompts.',
          code: 'LIMIT_REACHED',
        }),
      });
    });
    
    // Fill form and try to save
    await page.fill('[data-testid="prompt-name-input"]', 'Over Limit Prompt');
    await page.fill('[data-testid="prompt-content"]', 'This should fail');
    await page.click('[data-testid="save-prompt-button"]');
    
    // Verify limit error message
    await expect(page.locator('.sonner-toast')).toContainText('Free plan limit reached');
    
    // Verify upgrade suggestion appears
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
  });

  test('version limit enforcement for FREE users', async ({ page }) => {
    await page.goto('/prompts/create');
    
    // Mock existing prompt with 3 versions (at limit)
    await page.route('/api/prompts/prompt_123/versions', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'v1', content: 'Version 1' },
            { id: 'v2', content: 'Version 2' },
            { id: 'v3', content: 'Version 3' },
          ]),
        });
      } else {
        await route.fulfill({
          status: 402,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Free users can create up to 3 versions per prompt. Upgrade to PRO for unlimited versions.',
            code: 'VERSION_LIMIT_REACHED',
          }),
        });
      }
    });
    
    // Simulate having a saved prompt
    await page.evaluate(() => {
      window.localStorage.setItem('savedPromptId', 'prompt_123');
    });
    
    await page.reload();
    
    // Try to create new version
    await page.click('[data-testid="save-version-button"]');
    
    // Verify version limit error
    await expect(page.locator('.sonner-toast')).toContainText('Free users can create up to 3 versions');
    
    // Verify upgrade prompt in version control
    await expect(page.locator('[data-testid="version-upgrade-prompt"]')).toBeVisible();
  });

  test('PRO user unlimited access', async ({ page }) => {
    await page.goto('/prompts/create');
    
    // Mock PRO user
    await page.route('/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planType: 'PRO',
          Subscription: { status: 'ACTIVE' },
        }),
      });
    });
    
    // Mock successful save (no limits)
    await page.route('/api/prompts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'prompt_pro',
          name: 'PRO Prompt',
        }),
      });
    });
    
    // Fill and save prompt
    await page.fill('[data-testid="prompt-name-input"]', 'PRO Prompt');
    await page.fill('[data-testid="prompt-content"]', 'PRO content');
    await page.click('[data-testid="save-prompt-button"]');
    
    // Verify success (no limit errors)
    await expect(page.locator('.sonner-toast')).toContainText('Prompt saved successfully');
    
    // Verify PRO badge in version control
    await expect(page.locator('[data-testid="version-control"]')).toContainText('Unlimited');
  });
});
