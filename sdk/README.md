# CostLens SDK

Track and analyze AI API costs across OpenAI, Anthropic, and Claude. Real-time cost monitoring for developers.

📚 **[Full Documentation](https://costlens.dev/docs)** | 🚀 **[Quick Start](https://costlens.dev/docs/quickstart)**

## Installation

```bash
npm install costlens
```

## 💰 Cost Tracking Features

- 📊 **Real-time Tracking** - Monitor AI costs as they happen
- 🔍 **Multi-Provider** - OpenAI, Anthropic, Claude support
- 📈 **Cost Analytics** - Detailed spending insights
- 🚨 **Budget Alerts** - Get notified when costs spike
- 📋 **Usage Reports** - Export cost data and reports
- 🎯 **Feature Tracking** - Track costs by feature/user

## Quick Start

### Track AI Costs Automatically

```typescript
import OpenAI from 'openai';
import CostLens from 'costlens';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const costlens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY,
  trackCosts: true,      // 📊 Track all API costs
  budgetAlerts: true,    // 🚨 Get budget notifications
  exportData: true,      // 📋 Enable data exports
  costLimit: 100.00      // 💰 Max $100 per month
});

// Wrap the client for automatic cost tracking
const trackedOpenAI = costlens.wrapOpenAI(openai);

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
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  autoFallback: true  // Enable auto-fallback
});

const trackedOpenAI = promptcraft.wrapOpenAI(openai);

// If GPT-4 fails, automatically tries:
// 1. gpt-4-turbo
// 2. gpt-3.5-turbo
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
// Console: [PromptCraft] Fallback: gpt-4 failed, trying gpt-4-turbo...
// Console: [PromptCraft] Fallback success: gpt-4 → gpt-4-turbo
```

### Smart Routing

Automatically use cheaper models for simple queries:

```typescript
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  smartRouting: true  // Enable smart routing
});

const trackedOpenAI = promptcraft.wrapOpenAI(openai);

// Simple query → automatically routed to GPT-3.5 (60x cheaper!)
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',  // You request GPT-4
  messages: [{ role: 'user', content: 'Hi' }]  // But it's simple
});
// Console: [PromptCraft] Smart routing: gpt-4 → gpt-3.5-turbo
// Saves: $0.045 → $0.001 per 1K tokens (98% cost reduction!)
```

### Cost Limits

Prevent budget overruns:

```typescript
const trackedOpenAI = promptcraft.wrapOpenAI(openai);

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
// Console: [PromptCraft] Cache hit - $0 cost!
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

### Middleware

Add custom logic before/after API calls:

```typescript
const promptcraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
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
      onError: async (error) => {
        console.error('API call failed:', error);
      }
    }
  ]
});
```

### Batch Tracking

Track multiple calls efficiently:

```typescript
await promptcraft.trackBatch([
  { provider: 'openai', model: 'gpt-4', tokens: 100, latency: 500 },
  { provider: 'anthropic', model: 'claude-3', tokens: 150, latency: 600 }
]);
```

## Manual Tracking

For more control, track calls manually:

### OpenAI

```typescript
import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(
    params, 
    result, 
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.choices[0].message.content);
} catch (error) {
  await promptcraft.trackError('openai', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

### Anthropic

```typescript
import Anthropic from '@anthropic-ai/sdk';
import PromptCraft from 'promptcraft-sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await promptcraft.trackAnthropic(
    params, 
    result, 
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.content[0].text);
} catch (error) {
  await promptcraft.trackError('anthropic', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

### Google Gemini

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import PromptCraft from 'promptcraft-sdk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const params = { contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }] };

const start = Date.now();
try {
  const result = await model.generateContent(params);
  await promptcraft.trackGemini(
    { model: 'gemini-pro', ...params },
    result.response,
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.response.text());
} catch (error) {
  await promptcraft.trackError('gemini', 'gemini-pro', JSON.stringify(params), error, Date.now() - start);
  throw error;
}
```

### xAI Grok

```typescript
import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const params = {
  model: 'grok-beta',
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
try {
  const result = await grok.chat.completions.create(params);
  await promptcraft.trackGrok(
    params,
    result,
    Date.now() - start,
    'greeting-prompt' // optional promptId
  );
  console.log(result.choices[0].message.content);
} catch (error) {
  await promptcraft.trackError('grok', params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

## Configuration

```typescript
const promptcraft = new PromptCraft({
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
