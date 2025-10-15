# PromptCraft SDK

Official SDK for tracking OpenAI and Anthropic API usage with PromptCraft.

## Installation

```bash
npm install promptcraft-sdk
```

## Usage

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
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting-prompt' // optional
};

const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, Date.now() - start);
  console.log(result.choices[0].message.content);
} catch (error) {
  await promptcraft.trackError(params.model, JSON.stringify(params.messages), error, Date.now() - start);
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
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting-prompt' // optional
};

const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await promptcraft.trackAnthropic(params, result, Date.now() - start);
  console.log(result.content[0].text);
} catch (error) {
  await promptcraft.trackError(params.model, JSON.stringify(params.messages), error, Date.now() - start);
  throw error;
}
```

## Configuration

```typescript
const promptcraft = new PromptCraft({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com' // optional, defaults to https://promptcraft.app
});
```

## Get Your API Key

1. Sign up at [promptcraft.app](https://promptcraft.app)
2. Go to Settings → API Keys
3. Generate a new API key

## Features

- ✅ Track OpenAI API calls
- ✅ Track Anthropic API calls
- ✅ Automatic cost calculation
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ Zero performance impact (async tracking)

## License

MIT
