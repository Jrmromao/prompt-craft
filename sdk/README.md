# @promptcraft/sdk

Official SDK for [PromptCraft](https://promptcraft.app) - Track and optimize your AI costs.

## Installation

```bash
npm install @promptcraft/sdk
```

## Quick Start

### OpenAI

```typescript
import { PromptCraft } from '@promptcraft/sdk';
import OpenAI from 'openai';

const promptCraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrap once
promptCraft.wrapOpenAI(openai);

// Use normally - tracking happens automatically
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting', // Optional: for analytics
});
```

### Anthropic (Claude)

```typescript
import { PromptCraft } from '@promptcraft/sdk';
import Anthropic from '@anthropic-ai/sdk';

const promptCraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

promptCraft.wrapAnthropic(anthropic);

const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting',
});
```

## Manual Tracking

If you can't use the wrapper:

```typescript
await promptCraft.trackRun({
  promptId: 'customer-support',
  model: 'gpt-4',
  input: 'User question',
  output: 'AI response',
  tokensUsed: 150,
  latency: 1200,
  success: true,
});
```

## Configuration

```typescript
const promptCraft = new PromptCraft({
  apiKey: 'your-api-key',        // Required
  baseUrl: 'https://custom.com', // Optional (default: https://promptcraft.app)
});
```

## Get API Key

1. Sign up at [promptcraft.app](https://promptcraft.app)
2. Go to Settings → API Keys
3. Create new API key
4. Copy and use in your code

## Features

- ✅ Automatic cost tracking
- ✅ Token usage monitoring
- ✅ Latency tracking
- ✅ Success/failure tracking
- ✅ Zero performance impact
- ✅ Works with existing code

## Support

- **Docs**: [docs.promptcraft.app](https://docs.promptcraft.app)
- **Email**: support@promptcraft.app
- **Discord**: [Join community](https://discord.gg/promptcraft)

## License

MIT
