# Quick Start Guide

Get PromptCraft running locally in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional but recommended)

## 1. Clone & Install

```bash
git clone <your-repo>
cd prompt-craft
yarn install
```

## 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`

## 3. Setup Database

```bash
npx prisma migrate dev
npx prisma generate
```

## 4. Run Development Server

```bash
yarn dev
```

Visit http://localhost:3000

## 5. Test the Platform

### Create Account
1. Sign up at http://localhost:3000/sign-up
2. Complete onboarding

### Connect API Key
1. Go to Settings → Integrations
2. Add your OpenAI or Anthropic API key
3. Key is encrypted and stored securely

### Test SDK Integration

```typescript
import { PromptCraft } from './lib/sdk';
import OpenAI from 'openai';

const promptCraft = new PromptCraft({
  apiKey: 'your-promptcraft-api-key', // Get from settings
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
promptCraft.wrapOpenAI(openai);

// Use normally - tracking happens automatically
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  promptId: 'test-prompt',
});
```

### View Analytics
1. Go to Dashboard
2. See real-time cost tracking
3. View optimization suggestions

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Reset database
npx prisma migrate reset
```

### Redis Connection Error
Redis is optional. If not using Redis:
- Remove `REDIS_URL` from `.env`
- Caching will be disabled (still works)

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
yarn install
yarn build
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [API.md](./docs/API.md) for API reference
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

## Support

- Issues: GitHub Issues
- Email: support@promptcraft.app
