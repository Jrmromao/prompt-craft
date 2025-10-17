import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samplePosts = [
  {
    slug: 'why-claude-haiku-is-60x-cheaper',
    title: 'Why Claude Haiku is 60x Cheaper Than Opus',
    subtitle: 'Understanding Anthropic\'s pricing tiers and when to use each model',
    excerpt: 'Claude Haiku costs $0.00025 per 1K input tokens compared to Opus at $0.015. Here\'s when the cheaper model is actually better.',
    content: `When Anthropic released Claude 3, they introduced three tiers: Haiku, Sonnet, and Opus. The pricing difference is staggering.

## The Numbers

- **Claude 3 Opus:** $0.015 input / $0.075 output per 1K tokens
- **Claude 3 Sonnet:** $0.003 input / $0.015 output per 1K tokens  
- **Claude 3 Haiku:** $0.00025 input / $0.00125 output per 1K tokens

That means Haiku is **60x cheaper** than Opus for the same number of tokens.

## When to Use Haiku

Haiku excels at:

- Simple classification tasks
- Data extraction
- Quick Q&A
- Content moderation
- Sentiment analysis

## When to Use Opus

Opus is worth the premium for:

- Complex reasoning
- Creative writing
- Code generation
- Multi-step analysis

## Smart Routing

The best approach? Use smart routing to automatically select the right model based on task complexity. That's exactly what CostLens does.

> "We reduced our AI costs by 73% by routing simple queries to Haiku and complex ones to Opus."

Start tracking your AI costs today and see where you can optimize.`,
    tags: ['anthropic', 'pricing', 'optimization'],
    readTime: 4,
  },
  {
    slug: 'caching-strategies-for-llm-apis',
    title: 'Caching Strategies for LLM APIs',
    subtitle: 'How to achieve 80% cache hit rates and massive cost savings',
    excerpt: 'Implementing smart caching can reduce your LLM API costs by 80%. Here\'s how to do it right.',
    content: `Caching is the easiest way to reduce LLM costs. If you're making the same API calls repeatedly, you're wasting money.

## Why Caching Works

Many LLM use cases involve repetitive queries:

- Product descriptions
- FAQ responses
- Classification tasks
- Translation

## Cache Key Strategy

The key to effective caching is choosing the right cache key. We recommend:

\`\`\`
cacheKey = hash(model + prompt + temperature + max_tokens)
\`\`\`

## TTL Considerations

Different use cases need different TTLs:

- **Static content:** 7-30 days
- **Semi-static:** 1-7 days
- **Dynamic:** 1-24 hours

## Real Results

Our customers see:

- 60-80% cache hit rates
- Sub-10ms response times
- 70%+ cost reduction

CostLens includes built-in caching with configurable TTLs. Start saving today.`,
    tags: ['caching', 'optimization', 'performance'],
    readTime: 5,
  },
  {
    slug: 'openai-vs-anthropic-pricing-2024',
    title: 'OpenAI vs Anthropic: Pricing Comparison 2024',
    subtitle: 'A comprehensive breakdown of GPT-4 vs Claude 3 costs',
    excerpt: 'Comparing the latest pricing from OpenAI and Anthropic to help you choose the right provider.',
    content: `Both OpenAI and Anthropic have updated their pricing in 2024. Here's what you need to know.

## OpenAI Pricing

- **GPT-4 Turbo:** $0.01 input / $0.03 output per 1K tokens
- **GPT-3.5 Turbo:** $0.0005 input / $0.0015 output per 1K tokens

## Anthropic Pricing

- **Claude 3 Opus:** $0.015 input / $0.075 output per 1K tokens
- **Claude 3 Sonnet:** $0.003 input / $0.015 output per 1K tokens
- **Claude 3 Haiku:** $0.00025 input / $0.00125 output per 1K tokens

## Cost Comparison

For a typical 1000-token input, 2000-token output request:

- **GPT-4 Turbo:** $0.07
- **Claude 3 Opus:** $0.165
- **Claude 3 Sonnet:** $0.033
- **GPT-3.5 Turbo:** $0.0035
- **Claude 3 Haiku:** $0.0028

## Quality vs Cost

The cheapest model isn't always the best choice. Consider:

- Task complexity
- Required accuracy
- Response quality
- Context window needs

Track your costs across both providers with CostLens and optimize automatically.`,
    tags: ['openai', 'anthropic', 'pricing', 'comparison'],
    readTime: 6,
  },
];

async function main() {
  console.log('Seeding blog posts...');

  // Get first user (admin or any user)
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('No users found. Please sign up first at http://localhost:3000/sign-up');
    return;
  }

  console.log(`Using user: ${user.name || user.email} as author`);

  for (const post of samplePosts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existing) {
      console.log(`Post "${post.title}" already exists, skipping...`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        ...post,
        authorId: user.id,
        published: true,
        publishedAt: new Date(),
      },
    });

    console.log(`Created post: "${post.title}"`);
  }

  console.log('Blog seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
