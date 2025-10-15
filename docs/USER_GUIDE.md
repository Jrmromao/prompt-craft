# PromptCraft User Guide

Complete guide to tracking and optimizing your AI costs.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Connecting API Keys](#connecting-api-keys)
3. [Installing the SDK](#installing-the-sdk)
4. [Tracking AI Calls](#tracking-ai-calls)
5. [Viewing Analytics](#viewing-analytics)
6. [Setting Up Alerts](#setting-up-alerts)
7. [Team Collaboration](#team-collaboration)
8. [Exporting Data](#exporting-data)
9. [Subscription Plans](#subscription-plans)

---

## Getting Started

### 1. Create Account

Visit [promptcraft.app](https://promptcraft.app) and sign up with:
- Email & password
- Google OAuth
- GitHub OAuth

### 2. Complete Onboarding

Answer a few questions about:
- Your use case
- Monthly AI spend
- Team size

### 3. Choose a Plan

| Plan | Price | Tracked Runs | Best For |
|------|-------|--------------|----------|
| Free | $0 | 1,000/mo | Testing |
| Starter | $9/mo | 10,000/mo | Small projects |
| Pro | $29/mo | 100,000/mo | Growing teams |
| Enterprise | $99/mo | Unlimited | Large companies |

---

## Connecting API Keys

### OpenAI

1. Go to **Settings → Integrations**
2. Click **Connect OpenAI**
3. Paste your API key (starts with `sk-proj-...`)
4. Click **Save**

Your key is encrypted with AES-256 and never shared.

### Anthropic (Claude)

1. Go to **Settings → Integrations**
2. Click **Connect Anthropic**
3. Paste your API key (starts with `sk-ant-...`)
4. Click **Save**

---

## Installing the SDK

### Option 1: NPM Package (Recommended)

```bash
npm install @promptcraft/sdk
```

### Option 2: Copy from Project

Copy `lib/sdk.ts` from the PromptCraft repo into your project.

---

## Tracking AI Calls

### Automatic Tracking (Recommended)

Wrap your AI client once, and all calls are tracked automatically:

#### OpenAI

```typescript
import { PromptCraft } from '@promptcraft/sdk';
import OpenAI from 'openai';

// Initialize SDK
const promptCraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY, // From Settings → API Keys
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrap client (one-time setup)
promptCraft.wrapOpenAI(openai);

// Use OpenAI normally - tracking happens automatically!
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting', // Optional: tag for analytics
});
```

#### Anthropic (Claude)

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

// Use normally
const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting',
});
```

### Manual Tracking

If you can't use the wrapper:

```typescript
const promptCraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
});

// After your AI call
await promptCraft.trackRun({
  promptId: 'customer-support',
  model: 'gpt-4',
  input: userQuestion,
  output: aiResponse,
  tokensUsed: 150,
  latency: 1200, // milliseconds
  success: true,
});
```

---

## Viewing Analytics

### Dashboard Overview

Go to **Dashboard** to see:

- **Total Cost** - This month's AI spending
- **Total Runs** - Number of API calls
- **Success Rate** - % of successful calls
- **Avg Latency** - Response time

### Cost Breakdown

**By Model**:
- See which models cost the most
- Compare GPT-4 vs GPT-3.5 costs
- Identify optimization opportunities

**By Prompt**:
- See which prompts are most expensive
- Find prompts to optimize
- Track cost per use case

**Over Time**:
- Daily/weekly/monthly trends
- Spot cost spikes
- Track optimization impact

### Optimization Suggestions

PromptCraft automatically suggests:

- **"Use GPT-3.5 instead of GPT-4"** - For simple tasks
- **"This prompt has low success rate"** - Needs improvement
- **"High latency detected"** - Consider caching
- **"Cost spike detected"** - Investigate usage

---

## Setting Up Alerts

### Create Alert

1. Go to **Settings → Alerts**
2. Click **New Alert**
3. Choose type:
   - **Cost Spike** - Daily cost exceeds threshold
   - **High Error Rate** - Error rate exceeds %
   - **Slow Response** - Latency exceeds ms
4. Set threshold
5. Click **Create**

### Example Alerts

```
Alert: Cost Spike
Threshold: $100/day
→ Get notified if daily costs exceed $100

Alert: High Error Rate
Threshold: 10%
→ Get notified if >10% of calls fail

Alert: Slow Response
Threshold: 3000ms
→ Get notified if avg latency >3s
```

### Notification Channels

- **In-App** - Always enabled
- **Email** - Coming soon
- **Slack** - Coming soon
- **Webhook** - Coming soon

---

## Team Collaboration

### Invite Team Members

1. Go to **Settings → Team**
2. Click **Invite Member**
3. Enter email
4. Choose role:
   - **Admin** - Full access
   - **Member** - View only
5. Click **Send Invite**

### Team Limits

| Plan | Team Members |
|------|--------------|
| Free | 1 |
| Starter | 3 |
| Pro | 10 |
| Enterprise | Unlimited |

---

## Exporting Data

### CSV Export

1. Go to **Dashboard**
2. Click **Export**
3. Choose **CSV**
4. Select date range
5. Download

**CSV includes**:
- Date/time
- Prompt ID
- Model
- Provider
- Tokens used
- Cost
- Latency
- Success/failure

### JSON Export

For programmatic access:

```bash
curl https://promptcraft.app/api/export?format=json&days=30 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Report Generation

1. Go to **Dashboard**
2. Click **Generate Report**
3. Select date range
4. Download PDF (coming soon)

---

## Subscription Plans

### Upgrading

1. Go to **Settings → Billing**
2. Click **Upgrade**
3. Choose plan
4. Enter payment details
5. Confirm

### Downgrading

1. Go to **Settings → Billing**
2. Click **Change Plan**
3. Choose lower plan
4. Confirm

**Note**: Downgrades take effect at end of billing period.

### Canceling

1. Go to **Settings → Billing**
2. Click **Cancel Subscription**
3. Confirm

Your data is retained for 30 days after cancellation.

---

## FAQs

### Is my API key secure?

Yes! Your API keys are:
- Encrypted with AES-256
- Never logged or exposed
- Only decrypted when making calls
- Stored in secure database

### Does PromptCraft make AI calls on my behalf?

No! You provide your own API keys. PromptCraft only tracks the calls you make.

### What data is collected?

We track:
- Prompt input/output (for analytics)
- Token usage
- Cost
- Latency
- Success/failure

We never:
- Share your data
- Train models on your data
- Sell your data

### Can I delete my data?

Yes! Go to **Settings → Privacy → Delete Data**. All your data is permanently deleted within 24 hours.

### How accurate is cost tracking?

Very accurate! We use official pricing from:
- OpenAI pricing page
- Anthropic pricing page
- Updated monthly

### What if I hit my plan limit?

You'll receive a notification. Options:
1. Upgrade to higher plan
2. Wait until next month (Free plan)
3. Purchase additional runs (coming soon)

---

## Support

- **Email**: support@promptcraft.app
- **Discord**: [Join community](https://discord.gg/promptcraft)
- **Docs**: [docs.promptcraft.app](https://docs.promptcraft.app)
- **Status**: [status.promptcraft.app](https://status.promptcraft.app)

---

## Changelog

### v1.0.0 (Launch)
- Cost tracking for OpenAI & Anthropic
- Analytics dashboard
- Optimization suggestions
- Team collaboration
- Alerts & notifications
- Export to CSV/JSON
