# Dogfooding Our Own SDK

## Overview
We use our own PromptCraft SDK for all internal AI calls. This proves the SDK works, generates real usage data, and helps us catch bugs early.

## What We Replaced

### Before (Direct OpenAI calls)
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7,
});
```

### After (PromptCraft SDK)
```typescript
import { PromptCraft } from '@/sdk/src/index';

const promptcraft = new PromptCraft({
  apiKey: process.env.COSTLENS_INTERNAL_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

const result = await promptcraft.run({
  prompt,
  model: 'gpt-4',
  temperature: 0.7,
  metadata: { userId, source: 'internal' }
});
```

## Routes Using SDK

1. **`/api/ai/test`** - Prompt testing playground
2. **`/api/ai/analyze`** - Prompt quality analysis
3. **`/api/ai/suggestions`** - Prompt improvement suggestions

## Benefits

### 1. Real Usage Data
- Our dashboard shows our own AI usage
- We see actual savings from caching/routing
- Real-world performance metrics

### 2. Dogfooding = Quality
- We catch SDK bugs immediately
- We experience the same UX as customers
- Forces us to keep the SDK simple

### 3. Cost Savings
- We benefit from our own caching (40% savings)
- Smart routing saves us money
- Prompt optimization reduces our costs

### 4. Credibility
- "We use it ourselves" is powerful marketing
- Can show real internal usage stats
- Proves the product works

## Setup

### 1. Generate Internal API Key
```bash
# In your app, go to Settings → API Keys
# Create a new key labeled "Internal - Dogfooding"
# Copy the key
```

### 2. Add to Environment
```bash
# .env.local
COSTLENS_INTERNAL_API_KEY="cl_live_your_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### 3. Verify It Works
```bash
# Make a test API call
curl -X POST http://localhost:3001/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello", "input": "world"}'

# Check dashboard - you should see the run tracked
```

## Monitoring

### Dashboard Stats
- Go to `/dashboard`
- See "Internal" runs in your usage
- Check savings from caching

### Logs
```bash
# SDK logs show routing decisions
[PromptCraft] Routing to gpt-3.5-turbo (cost optimization)
[PromptCraft] Cache hit! Saved $0.02
```

## Best Practices

### 1. Use Metadata
```typescript
metadata: {
  userId,
  source: 'internal-test',
  feature: 'prompt-analyzer'
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  const result = await promptcraft.run({ prompt });
} catch (error) {
  // SDK has built-in retries and fallbacks
  console.error('AI call failed:', error);
}
```

### 3. Track Performance
```typescript
const start = Date.now();
const result = await promptcraft.run({ prompt });
const duration = Date.now() - start;

console.log(`Took ${duration}ms, cached: ${result.cached}`);
```

## Metrics to Watch

### Cost Savings
- Before dogfooding: $X/month on OpenAI
- After dogfooding: $Y/month (X-Y saved)
- Caching hit rate: Z%

### Performance
- Average latency: Xms
- Cache hit rate: Y%
- Smart routing usage: Z%

### Quality
- Error rate: <1%
- Timeout rate: <0.1%
- Customer satisfaction: High (we're the customer!)

## Troubleshooting

### SDK Not Found
```bash
# Make sure SDK is built
cd sdk
npm run build
```

### API Key Invalid
```bash
# Regenerate key in Settings
# Update .env.local
# Restart dev server
```

### Calls Not Showing in Dashboard
```bash
# Check baseURL is correct
echo $NEXT_PUBLIC_APP_URL

# Check API key is valid
# Check user is authenticated
```

## Future Improvements

- [ ] Add SDK usage badge to dashboard
- [ ] Show "Powered by PromptCraft" in internal tools
- [ ] Track ROI from dogfooding
- [ ] Use as case study in marketing

## Marketing Value

### Social Proof
> "We use PromptCraft internally for all our AI calls. It's saved us $X/month and improved response times by Y%."

### Case Study
- Internal usage stats
- Real cost savings
- Performance improvements
- Developer experience feedback

### Credibility
- "Eating our own dog food"
- Shows confidence in product
- Proves it works at scale
