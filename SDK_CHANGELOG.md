# PromptCraft SDK Changelog

## v1.0.0 (2025-10-16) - Initial Release 🚀

### Features

**Cost Optimization:**
- ✅ Smart routing (GPT-4 → GPT-3.5 for simple prompts)
- ✅ Redis caching (60-80% hit rates)
- ✅ AI-powered prompt compression (30-50% reduction)
- ✅ Cost limits and budget protection

**Quality & Safety:**
- ✅ Quality monitoring with user feedback
- ✅ Auto-disable routing on quality drop
- ✅ Fallback system with retry logic

**Tracking & Analytics:**
- ✅ Real-time cost tracking
- ✅ Savings calculation (baseline vs actual)
- ✅ Multi-provider support (OpenAI, Anthropic, Gemini, Grok)

### Installation

```bash
npm install promptcraft-sdk
```

### Quick Start

```typescript
import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true,      // Redis caching
  smartRouting: true,     // Auto-route to cheaper models
  autoOptimize: true,     // AI compression
  costLimit: 1.0,        // Budget protection
});

const openai = new OpenAI();
const tracked = promptcraft.wrapOpenAI(openai);

// Use normally - savings happen automatically!
const response = await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Environment Variables

```bash
# Required
PROMPTCRAFT_API_KEY=pc_your_key_here

# Optional (for optimization)
OPENAI_API_KEY=sk-proj-your_key

# Optional (for caching)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Server-Side Only

Caching and optimization require server-side environment (Node.js, Next.js API routes) for security.

### Support

- **Docs:** [prompthive.co/docs](https://prompthive.co/docs)
- **GitHub:** [github.com/Jrmromao/prompt-craft](https://github.com/Jrmromao/prompt-craft)
