# PromptCraft SDK

Official SDK for tracking OpenAI, Anthropic, Gemini, and Grok API usage with PromptCraft.

## Installation

```bash
npm install promptcraft-sdk
```

## 🔥 Killer Features (v2.0)

- 🚀 **Auto-Fallback** - GPT-4 fails? Automatically tries GPT-3.5
- 🧠 **Smart Routing** - Simple queries automatically use cheaper models (60x cost savings)
- 💰 **Cost Limits** - Set max cost per request to prevent budget overruns
- ⚡ **Smart Caching** - 80%+ cost savings on repeated queries
- 🔄 **Auto-Retry** - Exponential backoff for failed requests
- 📊 **Automatic Tracking** - Zero-config usage analytics
- 🎯 **Middleware** - Custom logic before/after/on-error
- 🌊 **Streaming** - Full support with automatic tracking

## Quick Start

### Basic Usage (Auto-Tracking)

```typescript
import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true,
  autoFallback: true,    // 🔥 NEW: Auto-fallback on errors
  smartRouting: true,    // 🔥 NEW: Route to cheaper models
  costLimit: 0.10        // 🔥 NEW: Max $0.10 per request
});

// Wrap the client for automatic tracking
const trackedOpenAI = promptcraft.wrapOpenAI(openai);

// Use it exactly like normal OpenAI!
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
// ✅ Smart routing: Simple query → automatically uses GPT-3.5 (60x cheaper!)
// ✅ Auto-fallback: If GPT-4 fails → tries GPT-4-turbo → tries GPT-3.5
// ✅ Cost limit: Throws error if estimated cost > $0.10
// ✅ Tracked automatically with zero config!
```

## 🔥 Killer Feature Examples

### Auto-Fallback

Never lose a request due to API errors:

```typescript
const promptcraft = new PromptCraft({ 
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

1. Sign up at [promptcraft.app](https://promptcraft.app)
2. Go to Settings → API Keys
3. Generate a new API key

## License

MIT
