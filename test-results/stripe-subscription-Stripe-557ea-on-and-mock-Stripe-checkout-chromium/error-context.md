# Test info

- Name: Stripe Subscription Flow >> User can see the subscription/checkout button and mock Stripe checkout
- Location: /Users/joaofilipe/Desktop/Workspace/PromptCraft/e2e/stripe-subscription.spec.ts:4:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "https://mocked-checkout.stripe.com/session"
Received: "http://localhost:3000/pricing"
    at /Users/joaofilipe/Desktop/Workspace/PromptCraft/e2e/stripe-subscription.spec.ts:34:24
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Stripe Subscription Flow', () => {
   4 |   test('User can see the subscription/checkout button and mock Stripe checkout', async ({ page, context }) => {
   5 |     // Set Clerk session cookie (replace with a valid value for your test user)
   6 |     await context.addCookies([{
   7 |       name: '__session',
   8 |       value: 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yYTJiaUo1bXI1YjlHSFRCdDdLMHZGcUd3MFYiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3d3dy5wcm9tcHRoaXZlLmNvIiwiZXhwIjoxNzQ5MjI3OTkyLCJmdmEiOls4MywtMV0sImlhdCI6MTc0OTIyNzkzMiwiaXNzIjoiaHR0cHM6Ly9mbHVlbnQtYW50LTEwLmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc0OTIyNzkyMiwic2lkIjoic2Vzc18yeThqOXpSQzZxRGZlZkRRVmZqZFRZWXBSdUsiLCJzdWIiOiJ1c2VyXzJ5NlV3OG5qYnhqQmZhbFIzSk1FS0dOMG90MCJ9.YvOExQxJNfqa1FGRg_T9figp2LdKveZ5_CrkU1z1lpvAcFnGo8ZOjr4H9Pij9wzTyEa90z5I1My-0axfro8RK5yAGdlgCw4N_8eev3omS5Oijjm-mCAIYU7r-3AOKsXjib-ATvCHH9fGt0D2MP3Zv-UHvhmahF2Gct9caJMFYmlHRstw9ULohawUBYwIB5OWesPchZHgZShvlJkgOC3gdx-I_PmIeTO7TBD-ws988uNvsUdlPLY16l434XRzrCNvkZX8bjmgX1kczhcdXcePXzymaQPuf5LgXfArC7JOkaWgTLi-BaUzkGetWtq06j1E0vC2GzcmouLiR9bGA2OSgg',
   9 |       domain: 'localhost',
  10 |       path: '/',
  11 |       httpOnly: true,
  12 |       secure: false,
  13 |       sameSite: 'Lax',
  14 |     }]);
  15 |
  16 |     // Abort navigation to the mocked Stripe URL to avoid browser error
  17 |     await page.route('https://mocked-checkout.stripe.com/session', route => route.abort());
  18 |
  19 |     // Mock the backend response for Stripe checkout session creation
  20 |     await page.route('**/api/stripe/create-checkout', async (route) => {
  21 |       await route.fulfill({
  22 |         status: 200,
  23 |         contentType: 'application/json',
  24 |         body: JSON.stringify({ url: 'https://mocked-checkout.stripe.com/session' }),
  25 |       });
  26 |     });
  27 |
  28 |     await page.goto('/pricing');
  29 |     const subscribeButton = page.getByRole('button', { name: 'Subscribe Monthly' });
  30 |     await expect(subscribeButton).toBeVisible();
  31 |
  32 |     await subscribeButton.click();
  33 |     // Assert navigation was attempted
> 34 |     expect(page.url()).toBe('https://mocked-checkout.stripe.com/session');
     |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  35 |   });
  36 | });
```
