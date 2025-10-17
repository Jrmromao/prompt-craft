# CostLens.dev

AI cost tracking and **automatic cost reduction** platform. Track every dollar AND cut costs by 60-80% with smart routing, caching, and optimization.

## 🚀 Features

- **Smart Model Routing** - Automatically route simple queries to cheaper models (60x cost savings)
- **Real-time Cost Tracking** - Monitor AI API costs as they happen
- **Intelligent Caching** - 80% savings on repeated queries
- **Auto-Fallback** - Never fail on rate limits, auto-switch to backup models
- **Prompt Optimization** - Reduce token usage by 50-80% automatically
- **Multi-Provider Support** - OpenAI, Anthropic, Claude, and more
- **Cost Analytics Dashboard** - Detailed insights into spending and savings
- **Budget Alerts** - Get notified when costs exceed thresholds
- **Team Collaboration** - Share cost insights and savings across your team

## 📦 Quick Start

### 1. Install SDK

```bash
npm install costlens
```

### 2. Integrate with Auto-Optimization

```typescript
import CostLens from 'costlens';
import OpenAI from 'openai';

// Initialize with cost reduction features
const costlens = new CostLens({
  apiKey: process.env.COSTLENS_API_KEY,
  smartRouting: true,    // 60x cost savings on simple queries
  autoOptimize: true,    // 50-80% token reduction
  enableCache: true,     // 80% savings on repeats
  autoFallback: true,    // Never fail on rate limits
  costLimit: 0.10        // Max $0.10 per request
});

// Wrap your OpenAI client
const optimizedOpenAI = costlens.wrapOpenAI(openai);

// Use normally - optimization happens automatically
const response = await optimizedOpenAI.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
// ✅ Automatically routed to gpt-3.5-turbo (60x cheaper)
// ✅ Prompt optimized (50% fewer tokens)
// ✅ Cached for future use
// ✅ Cost tracked in real-time
```

### 3. View Savings & Analytics

Visit your dashboard at `https://costlens.dev/dashboard` to see:
- Real-time cost tracking
- **Actual dollars saved** with smart routing
- Model performance vs cost analysis
- Budget alerts and notifications
- Usage trends and optimization insights

## 💰 Pricing

| Plan | Price | Tracked Calls | Features | Retention |
|------|-------|---------------|----------|-----------|
| Free | $0 | 1,000/mo | Basic tracking | 7 days |
| Starter | $9/mo | 10,000/mo | Alerts, exports | 30 days |
| Pro | $29/mo | 100,000/mo | Team features | 90 days |
| Enterprise | $99/mo | Unlimited | Custom integrations | 1 year |

## 🔧 Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Setup

```bash
# Clone repo
git clone https://github.com/yourusername/costlens.git
cd costlens

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

### Track API Call

```typescript
POST /api/track
{
  "provider": "openai",
  "model": "gpt-4",
  "input_tokens": 10,
  "output_tokens": 15,
  "cost": 0.0012,
  "metadata": { "feature": "chat" }
}
```

### Get Cost Analytics

```typescript
GET /api/analytics/costs?startDate=2024-01-01&endDate=2024-01-31
```

### Export Cost Data

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
docker build -t costlens .
docker run -p 3000:3000 costlens
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📞 Support

- Email: support@costlens.dev
- Discord: [Join our community](https://discord.gg/costlens)
- Docs: [docs.costlens.dev](https://docs.costlens.dev)
