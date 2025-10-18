# CostLens SDK

Track and analyze AI API costs across OpenAI, Anthropic, Claude, DeepSeek, and more. Real-time cost monitoring for developers.

📚 **[Full Documentation](https://costlens.dev/docs)** | 🚀 **[Quick Start](https://costlens.dev/docs/quickstart)**

## Installation

```bash
npm install costlens
```

## 💰 Cost Tracking Features

- 📊 **Real-time Tracking** - Monitor AI costs as they happen
- 🔍 **Multi-Provider** - OpenAI, Anthropic, Claude, DeepSeek support
- 📈 **Cost Analytics** - Detailed spending insights
- 🚨 **Budget Alerts** - Get notified when costs spike
- 📋 **Usage Reports** - Export cost data and reports
- 🎯 **Feature Tracking** - Track costs by feature/user

## 🚀 2025 Model Support

CostLens now supports the latest 2025 models with updated pricing:

- **GPT-4o** - OpenAI's latest model (7x cheaper than GPT-4!)
- **Claude-3.5 Sonnet** - Anthropic's 2025 model (25% price cut!)
- **Gemini-1.5 Flash** - Google's ultra-affordable 2025 model
- **DeepSeek-V3.2-Exp** - Still the most cost-effective option (128x cheaper than GPT-4!)

## Quick Start

### Track AI Costs Automatically

```typescript
import OpenAI from 'openai';
import CostLens from 'costlens';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY,
  enableCache: true,     // 📊 Enable response caching
  autoFallback: true,    // 🔄 Auto-fallback on failures
  smartRouting: true,    // 🎯 Smart model routing
  costLimit: 100.00      // 💰 Max $100 per month
});

// Wrap the client for automatic cost tracking
const trackedOpenAI = costLens.wrapOpenAI(openai);

// Use it exactly like normal OpenAI!
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  metadata: { feature: 'chat', user: 'user123' }
});
// ✅ Cost tracked automatically
// ✅ Usage analytics recorded
// ✅ Budget monitoring active
// ✅ Feature-level insights!
```

## 🔥 Key Features

### Budget Monitoring

Set spending limits and get alerts:

```typescript
const costlens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY,
  autoFallback: true  // Enable auto-fallback
});

const trackedOpenAI = costLens.wrapOpenAI(openai);

// If GPT-4 fails, automatically tries:
// 1. gpt-4-turbo
// 2. gpt-3.5-turbo
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
// Console: [CostLens] Fallback: gpt-4 failed, trying gpt-4-turbo...
// Console: [CostLens] Fallback success: gpt-4 → gpt-4-turbo
```

### Smart Routing

Automatically use cheaper models for simple queries:

```typescript
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY,
  smartRouting: true  // Enable smart routing
});

const trackedOpenAI = costLens.wrapOpenAI(openai);

// Simple query → automatically routed to DeepSeek (128x cheaper!)
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',  // You request GPT-4
  messages: [{ role: 'user', content: 'Hi' }]  // But it's simple
});
// Console: [CostLens] Smart routing: gpt-4 → deepseek-chat
// Saves: $45 → $0.35 per 1M tokens (99.2% cost reduction!)

// Medium complexity → routed to GPT-4o (7x cheaper than GPT-4!)
const result2 = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Explain quantum computing in detail' }]
});
// Console: [CostLens] Smart routing: gpt-4 → gpt-4o
// Saves: $45 → $6.25 per 1M tokens (86% cost reduction!)
```

### Cost Limits

Prevent budget overruns:

```typescript
const trackedOpenAI = costLens.wrapOpenAI(openai);

try {
  const result = await trackedOpenAI.chat.completions.create(
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Very long prompt...' }]
    },
    { maxCost: 0.05 }  // Max $0.05 per request
  );
} catch (error) {
  // Error: Estimated cost $0.08 exceeds limit $0.05
}
```

### Custom Fallback Models

Override default fallback chain:

```typescript
const result = await trackedOpenAI.chat.completions.create(
  {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  },
  { 
    fallbackModels: ['gpt-3.5-turbo']  // Custom fallback chain
  }
);
```

## Advanced Features

### Caching

Save costs by caching identical requests:

```typescript
const result = await trackedOpenAI.chat.completions.create(
  { model: 'gpt-4', messages: [...] },
  { cacheTTL: 3600000 } // Cache for 1 hour
);
// Console: [CostLens] Cache hit - $0 cost!
```

### Streaming

Track streaming responses automatically:

```typescript
const stream = await trackedOpenAI.chat.completions.stream({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
// ✅ Automatically tracked after stream completes
```

### Enhanced Error Handling

The SDK provides comprehensive error context for monitoring and debugging:

```typescript
import * as Sentry from '@sentry/nextjs';

const costLens = new CostLens({
  apiKey: process.env.COSTLENS_API_KEY,
  middleware: [
    {
      before: async (params) => {
        console.log('Making API call...');
        return params;
      },
      after: async (result) => {
        console.log('API call completed!');
        return result;
      },
      onError: async (error, context) => {
        // Rich error context for monitoring
        console.error('API call failed:', {
          error: error.message,
          provider: context.provider,
          model: context.model,
          attempt: context.attempt,
          maxRetries: context.maxRetries,
          latency: context.latency,
          userId: context.userId,
          promptId: context.promptId
        });

        // Send to your monitoring service
        Sentry.captureException(error, {
          tags: {
            component: 'costlens-sdk',
            provider: context.provider,
            model: context.model
          },
          extra: {
            attempt: context.attempt,
            maxRetries: context.maxRetries,
            latency: context.latency,
            userId: context.userId,
            promptId: context.promptId,
            metadata: context.metadata
          }
        });
      }
    }
  ]
});
```

**Error Context includes:**
- `provider`: AI provider (openai, anthropic, etc.)
- `model`: Model that failed
- `input`: Input that caused the error
- `latency`: Time taken before failure
- `attempt`: Current attempt number
- `maxRetries`: Total retry attempts
- `userId`: Optional user identifier
- `promptId`: Optional prompt identifier
- `metadata`: Additional context (fallback chain, etc.)

### Batch Tracking

Track multiple calls efficiently:

```typescript
await costLens.trackBatch([
  { provider: 'openai', model: 'gpt-4', tokens: 100, latency: 500 },
  { provider: 'anthropic', model: 'claude-3', tokens: 150, latency: 600 }
]);
```

## Manual Tracking

For more control, track calls manually:

### OpenAI

```typescript
import OpenAI from 'openai';
import CostLens from 'costlens';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY 
});

const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await costLens.trackOpenAI(
    params, 
    result, 
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.choices[0].message.content);
} catch (error) {
  await costLens.trackError('openai', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

### Anthropic

```typescript
import Anthropic from '@anthropic-ai/sdk';
import CostLens from 'costlens';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY 
});

const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await costLens.trackAnthropic(
    params, 
    result, 
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.content[0].text);
} catch (error) {
  await costLens.trackError('anthropic', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

### Google Gemini

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import CostLens from 'costlens';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY 
});

const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const params = { contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }] };

const start = Date.now();
try {
  const result = await model.generateContent(params);
  await costLens.trackGemini(
    { model: 'gemini-pro', ...params },
    result.response,
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.response.text());
} catch (error) {
  await costLens.trackError('gemini', 'gemini-pro', JSON.stringify(params), error, Date.now() - start);
  throw error;
}
```

### xAI Grok

```typescript
import OpenAI from 'openai';
import CostLens from 'costlens';

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY 
});

const params = {
  model: 'grok-beta',
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await grok.chat.completions.create(params);
  await costLens.trackGrok(
    params,
    result,
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.choices[0].message.content);
} catch (error) {
  await costLens.trackError('grok', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

### DeepSeek (Ultra Cost-Effective!)

**2025 Pricing (V3.2-Exp - Official):**
- **DeepSeek-Chat**: $0.28 input + $0.42 output = $0.35/1M tokens
- **DeepSeek-Reasoner**: $0.28 input + $0.42 output = $0.35/1M tokens
- **Cache Hit**: $0.028 input + $0.42 output = $0.224/1M tokens (even cheaper!)
- **128x cheaper** than GPT-4!

```typescript
import OpenAI from 'openai';
import CostLens from 'costlens';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});
const costLens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY 
});

const params = {
  model: 'deepseek-chat', // or 'deepseek-reasoner' for reasoning
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await deepseek.chat.completions.create(params);
  await costLens.trackDeepSeek(
    params,
    result,
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.choices[0].message.content);
} catch (error) {
  await costLens.trackError('deepseek', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

## Configuration

```typescript
const costLens = new CostLens({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com', // optional
  enableCache: true,                     // Enable response caching
  maxRetries: 3,                         // Auto-retry failed calls
  middleware: []                         // Custom middleware
});
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## Get Your API Key

1. Sign up at [prompthive.co](https://prompthive.co)
2. Go to Settings → API Keys
3. Generate a new API key

## License

MIT
