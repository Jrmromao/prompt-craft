import { test, expect } from '@playwright/test';

test.describe('Stripe Subscription Flow', () => {
  test('User can see the subscription/checkout button and mock Stripe checkout', async ({ page, context }) => {
    // Set Clerk session cookie (replace with a valid value for your test user)
    await context.addCookies([{
      name: '__session',
      value: 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yYTJiaUo1bXI1YjlHSFRCdDdLMHZGcUd3MFYiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3d3dy5wcm9tcHRoaXZlLmNvIiwiZXhwIjoxNzQ5MjI3OTkyLCJmdmEiOls4MywtMV0sImlhdCI6MTc0OTIyNzkzMiwiaXNzIjoiaHR0cHM6Ly9mbHVlbnQtYW50LTEwLmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc0OTIyNzkyMiwic2lkIjoic2Vzc18yeThqOXpSQzZxRGZlZkRRVmZqZFRZWXBSdUsiLCJzdWIiOiJ1c2VyXzJ5NlV3OG5qYnhqQmZhbFIzSk1FS0dOMG90MCJ9.YvOExQxJNfqa1FGRg_T9figp2LdKveZ5_CrkU1z1lpvAcFnGo8ZOjr4H9Pij9wzTyEa90z5I1My-0axfro8RK5yAGdlgCw4N_8eev3omS5Oijjm-mCAIYU7r-3AOKsXjib-ATvCHH9fGt0D2MP3Zv-UHvhmahF2Gct9caJMFYmlHRstw9ULohawUBYwIB5OWesPchZHgZShvlJkgOC3gdx-I_PmIeTO7TBD-ws988uNvsUdlPLY16l434XRzrCNvkZX8bjmgX1kczhcdXcePXzymaQPuf5LgXfArC7JOkaWgTLi-BaUzkGetWtq06j1E0vC2GzcmouLiR9bGA2OSgg',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    }]);

    // Abort navigation to the mocked Stripe URL to avoid browser error
    await page.route('https://mocked-checkout.stripe.com/session', route => route.abort());

    // Mock the backend response for Stripe checkout session creation
    await page.route('**/api/stripe/create-checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://mocked-checkout.stripe.com/session' }),
      });
    });

    await page.goto('/pricing');
    const subscribeButton = page.getByRole('button', { name: 'Subscribe Monthly' });
    await expect(subscribeButton).toBeVisible();

    await subscribeButton.click();
    // Assert navigation was attempted
    expect(page.url()).toBe('https://mocked-checkout.stripe.com/session');
  });
}); 