# CostLens SDK - Save 70-95% on AI Costs

**Automatically optimize your OpenAI & Anthropic API costs without changing your code.**

## 💰 Instant Savings

**OpenAI Models:**
- **GPT-4 → GPT-3.5**: Save 98% on simple tasks
- **GPT-4 → GPT-4o**: Save 86% on medium complexity

**Anthropic Models:**
- **Claude Opus → Claude Haiku**: Save 98% on simple tasks  
- **Claude Opus → Claude Sonnet**: Save 93% on medium complexity
- **Claude Sonnet → Claude Haiku**: Save 92% on simple tasks

**Plus:**
- **Prompt optimization**: Additional 20% savings
- **Smart caching**: 100% savings on repeated requests

## 🚀 Quick Start

```bash
npm install costlens-sdk
```

```javascript
import CostLens from 'costlens-sdk';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Wrap your existing clients
const costlens = new CostLens({ apiKey: 'cl_your_api_key' });

// OpenAI optimization
const openai = costlens.wrapOpenAI(new OpenAI({ apiKey: 'your_openai_key' }));

// Anthropic optimization  
const anthropic = costlens.wrapAnthropic(new Anthropic({ apiKey: 'your_anthropic_key' }));

// Same code, automatic savings
const response = await openai.chat.completions.create({
  model: 'gpt-4', // Auto-routed to cheaper model when safe
  messages: [{ role: 'user', content: 'Summarize this article...' }]
});

const claudeResponse = await anthropic.messages.create({
  model: 'claude-3-opus', // Auto-routed to claude-3-haiku for simple tasks
  messages: [{ role: 'user', content: 'Quick summary please...' }]
});
```

## 📊 Real Savings Example

**Before CostLens:**
- 500 GPT-4 requests/month: **$200**

**After CostLens:**
- 150 stay on GPT-4 (complex): $67
- 200 routed to GPT-4o (medium): $12  
- 150 routed to GPT-3.5 (simple): $1
- **Total: $80** (60% savings)

**ROI**: Pay $9/month Starter plan, save $120/month = **$111 net savings**

## ✅ Quality Guaranteed

- Automatic quality validation
- Conservative routing (quality first)
- Instant fallback to premium models if needed
- Critical tasks never routed

## 🔧 Features

### Core (Works with OpenAI only)
- ✅ Smart model routing
- ✅ Prompt optimization  
- ✅ Response caching
- ✅ Usage tracking

### Pro (Multi-provider)
- ✅ Claude integration
- ✅ Gemini integration  
- ✅ DeepSeek integration
- ✅ Advanced quality algorithms

## 📈 Get Started

1. **Sign up**: [costlens.dev](https://costlens.dev)
2. **Get API key**: Dashboard → API Keys
3. **Install SDK**: `npm install costlens-sdk`
4. **Start saving**: Wrap your OpenAI client

**No code changes required. Just wrap and save.**
