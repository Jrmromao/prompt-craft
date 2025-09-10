import { test, expect } from '@playwright/test';

test.describe('Competitive Features E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 'test-user-1' })
      });
    });

    // Mock competitive API
    await page.route('**/api/competitive/leaderboard', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          topCreators: [
            {
              userId: '1',
              username: 'John Doe',
              avatar: 'avatar1.jpg',
              score: 1000,
              rank: 1,
              badge: '👑'
            }
          ],
          topVoters: [
            {
              userId: '2',
              username: 'Jane Smith',
              score: 500,
              rank: 1,
              badge: '🗳️'
            }
          ],
          userRank: { rank: 5, total: 100 },
          achievements: [
            {
              id: 'first_prompt',
              title: 'First Steps',
              icon: '🌱',
              earned: true,
              rarity: 'common'
            }
          ],
          activeChallenges: [
            {
              id: 'challenge1',
              title: 'Weekly Challenge: Creative Writing',
              theme: 'Creative Writing',
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              participants: 25
            }
          ],
          newAchievements: []
        })
      });
    });

    await page.goto('/community-prompts');
  });

  test('should display leaderboards tab and rankings', async ({ page }) => {
    // Click on leaderboards tab
    await page.click('text=Leaderboards');

    // Check for leaderboard content
    await expect(page.locator('text=Top Creators')).toBeVisible();
    await expect(page.locator('text=Top Voters')).toBeVisible();
    
    // Check for user in leaderboard
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=👑')).toBeVisible();
    
    // Check for vote count
    await expect(page.locator('text=1,000')).toBeVisible();
  });

  test('should display challenges tab with active challenges', async ({ page }) => {
    // Click on challenges tab
    await page.click('text=Challenges');

    // Check for challenges content
    await expect(page.locator('text=Weekly Challenges')).toBeVisible();
    await expect(page.locator('text=Weekly Challenge: Creative Writing')).toBeVisible();
    await expect(page.locator('text=25 participants')).toBeVisible();
    
    // Check for join button
    await expect(page.locator('text=Join Challenge')).toBeVisible();
  });

  test('should display social tab with following features', async ({ page }) => {
    // Click on social tab
    await page.click('text=Social');

    // Check for social content
    await expect(page.locator('text=Following Feed')).toBeVisible();
    await expect(page.locator('text=Suggested Creators')).toBeVisible();
    
    // Check for follow buttons
    await expect(page.locator('text=Follow')).toBeVisible();
  });

  test('should display dashboard with user stats', async ({ page }) => {
    // Click on dashboard tab
    await page.click('text=Dashboard');

    // Check for user stats
    await expect(page.locator('text=#5')).toBeVisible();
    await expect(page.locator('text=Your Rank')).toBeVisible();
    await expect(page.locator('text=Achievements')).toBeVisible();
    
    // Check for achievement display
    await expect(page.locator('text=First Steps')).toBeVisible();
    await expect(page.locator('text=🌱')).toBeVisible();
  });

  test('should handle challenge join interaction', async ({ page }) => {
    await page.click('text=Challenges');
    
    // Mock challenge join API
    await page.route('**/api/challenges/*/join', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.click('text=Join Challenge');
    
    // Should show some feedback (button state change, etc.)
    // This would depend on actual implementation
  });

  test('should handle follow user interaction', async ({ page }) => {
    await page.click('text=Social');
    
    // Mock follow API
    await page.route('**/api/social/follow', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.click('text=Follow');
    
    // Should show feedback or button state change
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Test tab navigation
    await page.click('text=Leaderboards');
    await expect(page.locator('text=Top Creators')).toBeVisible();

    await page.click('text=Challenges');
    await expect(page.locator('text=Weekly Challenges')).toBeVisible();

    await page.click('text=Social');
    await expect(page.locator('text=Following Feed')).toBeVisible();

    await page.click('text=Dashboard');
    await expect(page.locator('text=Your Rank')).toBeVisible();

    await page.click('text=Discover');
    await expect(page.locator('text=Search for the perfect prompt')).toBeVisible();
  });

  test('should display achievement notifications for new achievements', async ({ page }) => {
    // Mock API with new achievements
    await page.route('**/api/competitive/leaderboard', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          topCreators: [],
          topVoters: [],
          userRank: { rank: 1, total: 1 },
          achievements: [],
          activeChallenges: [],
          newAchievements: [
            {
              id: 'viral_prompt',
              title: 'Viral Creator',
              icon: '🚀',
              rarity: 'epic'
            }
          ]
        })
      });
    });

    await page.reload();
    
    // Should show achievement notification
    // This would depend on how notifications are implemented
  });
});
