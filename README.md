# PromptCraft Analytics

AI cost tracking and optimization platform. Track every AI API call, analyze costs, and get optimization suggestions.

## 🚀 Features

- **Cost Tracking** - Track costs across OpenAI, Anthropic, and other providers
- **Analytics Dashboard** - Real-time insights into AI spending
- **Optimization Suggestions** - AI-powered recommendations to reduce costs
- **Team Collaboration** - Invite team members and share insights
- **Alerts & Notifications** - Get notified when costs spike or errors increase
- **Export & Reporting** - Export data to CSV/JSON, generate reports

## 📦 Quick Start

### 1. Install SDK

```bash
npm install promptcraft-sdk
```

### 2. Integrate with Your App

```typescript
import { PromptCraft } from 'promptcraft-sdk';
import OpenAI from 'openai';

// Initialize SDK
const promptCraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
});

// Wrap your OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
promptCraft.wrapOpenAI(openai);

// Use OpenAI normally - tracking happens automatically
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'greeting', // Track which prompt
});
```

### 3. View Analytics

Visit your dashboard at `https://promptcraft.app/dashboard` to see:
- Real-time cost tracking
- Model performance comparison
- Optimization suggestions
- Usage trends

## 💰 Pricing

| Plan | Price | Tracked Runs | Prompts | Retention |
|------|-------|--------------|---------|-----------|
| Free | $0 | 1,000/mo | 5 | 7 days |
| Starter | $9/mo | 10,000/mo | 25 | 30 days |
| Pro | $29/mo | 100,000/mo | Unlimited | 90 days |
| Enterprise | $99/mo | Unlimited | Unlimited | 1 year |

## 🔧 Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Setup

```bash
# Clone repo
git clone https://github.com/yourusername/promptcraft.git
cd promptcraft

# Install dependencies
yarn install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npx prisma migrate dev

# Start dev server
yarn dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional
REDIS_URL="redis://..."
```

## 📚 API Reference

### Track Run

```typescript
POST /api/integrations/run
{
  "promptId": "greeting",
  "model": "gpt-4",
  "provider": "openai",
  "input": "Hello",
  "output": "Hi there!",
  "tokensUsed": 10,
  "success": true
}
```

### Get Analytics

```typescript
GET /api/analytics/overview?startDate=2024-01-01&endDate=2024-01-31
```

### Export Data

```typescript
GET /api/export?format=csv&days=30
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run specific test
yarn test subscription.test.ts

# Coverage
yarn test --coverage
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t promptcraft .
docker run -p 3000:3000 promptcraft
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📞 Support

- Email: support@promptcraft.app
- Discord: [Join our community](https://discord.gg/promptcraft)
- Docs: [docs.promptcraft.app](https://docs.promptcraft.app)
