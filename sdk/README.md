# PromptCraft SDK

Official SDK for tracking OpenAI, Anthropic, Gemini, and Grok API usage with PromptCraft.

## Installation

```bash
npm install promptcraft-sdk
```

## Features

- ✅ **Automatic tracking** with wrapper functions
- ✅ **Smart caching** to reduce API costs
- ✅ **Auto-retry** with exponential backoff
- ✅ **Middleware support** for custom logic
- ✅ **Streaming support** for real-time responses
- ✅ **Batch tracking** for multiple calls
- ✅ **Error tracking** with automatic logging
- ✅ **Zero performance impact** (async tracking)
- ✅ **Full TypeScript support**

## Quick Start

### Automatic Tracking (Recommended)

```typescript
import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true,  // Enable response caching
  maxRetries: 3       // Auto-retry failed calls
});

// Wrap the client for automatic tracking
const trackedOpenAI = promptcraft.wrapOpenAI(openai);

// Use it exactly like normal OpenAI - tracking happens automatically!
const result = await trackedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(result.choices[0].message.content);
// ✅ Automatically tracked with error handling and retries!
```

## Advanced Features

### Caching

Save costs by caching identical requests:

```typescript
const result = await trackedOpenAI.chat.completions.create(
  { model: 'gpt-4', messages: [...] },
  { cacheTTL: 3600000 } // Cache for 1 hour
);
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
