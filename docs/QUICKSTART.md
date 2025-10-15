# Quick Start Guide

Get started with PromptCraft in 5 minutes.

## Step 1: Sign Up (1 minute)

1. Go to [promptcraft.app](https://promptcraft.app)
2. Click "Start Free Trial"
3. Sign up with email or Google/GitHub
4. You're in! Free tier includes 1,000 runs/month

## Step 2: Get Your API Key (1 minute)

1. Go to Settings (click your avatar → Settings)
2. Click "Create Key"
3. Name it (e.g., "Production")
4. **Copy the key now** - you won't see it again!
5. Save it to your `.env` file

```bash
PROMPTCRAFT_API_KEY=pc_your_key_here
```

## Step 3: Install SDK (30 seconds)

```bash
npm install promptcraft-sdk
```

## Step 4: Add 2 Lines of Code (2 minutes)

### For OpenAI:

```typescript
import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const openai = new OpenAI();

// Your existing code:
const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
};

// Add these 2 lines:
const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);
// Done!
```

### For Anthropic:

```typescript
import PromptCraft from 'promptcraft-sdk';
import Anthropic from '@anthropic-ai/sdk';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const anthropic = new Anthropic();

// Your existing code:
const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
};

// Add these 2 lines:
const start = Date.now();
const result = await anthropic.messages.create(params);
await promptcraft.trackAnthropic(params, result, Date.now() - start);
// Done!
```

## Step 5: View Your Dashboard (30 seconds)

1. Make a few API calls
2. Go to [promptcraft.app/dashboard](https://promptcraft.app/dashboard)
3. See your costs in real-time!

## What You'll See

- **Total runs** - Number of API calls tracked
- **Total cost** - How much you've spent
- **Cost per run** - Average cost per API call
- **Success rate** - Percentage of successful calls
- **Charts** - Cost trends over time

## Next Steps

### Set Budget Alerts

1. Go to Settings
2. Set a monthly budget (e.g., $100)
3. Get notified at 50%, 80%, 100%

### Tag Your Prompts

Add `promptId` to track specific prompts:

```typescript
const params = {
  model: 'gpt-4',
  messages: [...],
  promptId: 'customer-support-v1' // Track this prompt
};
```

View analytics by prompt in your dashboard.

### Invite Your Team

1. Go to Settings → Team
2. Invite team members
3. They can view analytics too

## Common Issues

### "API key not working"
- Check it starts with `pc_`
- Make sure you copied the whole key
- Verify it wasn't deleted in Settings

### "Not seeing data"
- Wait 1-2 minutes for sync
- Check browser console for errors
- Verify you're calling `trackOpenAI()` or `trackAnthropic()`

### "Rate limit exceeded"
- Free tier: 10 requests/minute
- Upgrade to Starter for 60/min

## Need Help?

- **Docs**: [Full Developer Guide](./DEVELOPER_GUIDE.md)
- **API Reference**: [API Reference](./API_REFERENCE.md)
- **Email**: support@promptcraft.app

## Upgrade When Ready

Start free, upgrade when you need more:

- **Starter ($9/mo)**: 10,000 runs, 30 days retention
- **Pro ($29/mo)**: 100,000 runs, 90 days retention
- **Enterprise ($99/mo)**: Unlimited runs, 1 year retention

[View Pricing](https://promptcraft.app/pricing)
