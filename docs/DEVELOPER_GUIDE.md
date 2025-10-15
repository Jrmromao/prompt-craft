# PromptCraft Developer Guide

Complete guide for integrating PromptCraft into your application to track AI costs.

## Quick Start

### 1. Installation

```bash
npm install promptcraft-sdk
# or
yarn add promptcraft-sdk
```

### 2. Get Your API Key

1. Sign up at [promptcraft.app](https://promptcraft.app)
2. Go to Settings → API Keys
3. Create a new API key
4. Copy it (you'll only see it once!)

### 3. Basic Integration

```typescript
import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

// Initialize PromptCraft
const promptcraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Make your API call
const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
const result = await openai.chat.completions.create(params);

// Track the call
await promptcraft.trackOpenAI(params, result, Date.now() - start);
```

## Supported Providers

### OpenAI

```typescript
import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const promptcraft = new PromptCraft({ apiKey: process.env.PROMPTCRAFT_API_KEY });

const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting-v1' // Optional: tag for analytics
};

const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, Date.now() - start);
  return result;
} catch (error) {
  await promptcraft.trackError('gpt-4', JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

### Anthropic (Claude)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import PromptCraft from 'promptcraft-sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const promptcraft = new PromptCraft({ apiKey: process.env.PROMPTCRAFT_API_KEY });

const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting-v1' // Optional
};

const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await promptcraft.trackAnthropic(params, result, Date.now() - start);
  return result;
} catch (error) {
  await promptcraft.trackError(params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

## Advanced Usage

### Tagging Prompts

Use `promptId` to group and analyze specific prompts:

```typescript
const params = {
  model: 'gpt-4',
  messages: [...],
  promptId: 'customer-support-v2' // Track this specific prompt
};
```

View analytics by prompt in your dashboard.

### Error Tracking

Track failed API calls:

```typescript
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, latency);
} catch (error) {
  await promptcraft.trackError(
    params.model,
    JSON.stringify(params.messages),
    error,
    latency
  );
  throw error;
}
```

### Environment Variables

```bash
# .env
PROMPTCRAFT_API_KEY=pc_your_api_key_here
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
```

### Custom Base URL (Self-Hosted)

```typescript
const promptcraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  baseUrl: 'https://your-instance.com' // Optional
});
```

## What Gets Tracked

For each API call, we track:

- **Model** - Which AI model was used
- **Tokens** - Input and output token counts
- **Cost** - Calculated based on model pricing
- **Latency** - Response time in milliseconds
- **Success/Failure** - Whether the call succeeded
- **Timestamp** - When the call was made
- **Prompt ID** - Optional tag for grouping

## Pricing

### Free Tier
- 1,000 tracked runs/month
- 7 days data retention
- Basic analytics

### Starter ($9/month)
- 10,000 tracked runs/month
- 30 days data retention
- Advanced analytics

### Pro ($29/month)
- 100,000 tracked runs/month
- 90 days data retention
- Cost optimization suggestions

### Enterprise ($99/month)
- Unlimited tracked runs
- 1 year data retention
- Dedicated support

## Best Practices

### 1. Use Prompt IDs

Tag your prompts for better analytics:

```typescript
promptId: 'feature-name-v1'
```

### 2. Track Errors

Always track failed calls to see error rates:

```typescript
catch (error) {
  await promptcraft.trackError(...);
}
```

### 3. Set Budget Alerts

Configure alerts in Settings to avoid surprise bills.

### 4. Review Analytics Weekly

Check your dashboard to identify:
- Most expensive prompts
- Slow responses
- High error rates
- Optimization opportunities

## Troubleshooting

### API Key Not Working

1. Check the key is correct (starts with `pc_`)
2. Verify it hasn't been deleted
3. Check your plan limits (Free: 1,000 runs/month)

### Tracking Not Appearing

1. Wait 1-2 minutes for data to sync
2. Check browser console for errors
3. Verify API key is set correctly
4. Check you're calling `trackOpenAI()` or `trackAnthropic()`

### Rate Limits

Free tier: 10 requests/minute
Starter: 60 requests/minute
Pro: 300 requests/minute
Enterprise: 1,000 requests/minute

## Support

- **Documentation**: [docs.promptcraft.app](https://docs.promptcraft.app)
- **Email**: support@promptcraft.app
- **Discord**: [discord.gg/promptcraft](https://discord.gg/promptcraft)

## Examples

See [examples/](./examples/) for complete working examples:
- `examples/openai-basic.ts` - Basic OpenAI integration
- `examples/anthropic-basic.ts` - Basic Anthropic integration
- `examples/error-handling.ts` - Proper error tracking
- `examples/express-api.ts` - Express.js API integration
- `examples/nextjs-api.ts` - Next.js API route integration
