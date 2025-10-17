---
title: "LLM Caching: Save 40% on OpenAI and Anthropic Costs"
description: "Complete guide to LLM response caching. Learn semantic caching, prompt caching, and implementation strategies to reduce AI API costs by 40%."
author: "CostLens Team"
date: "2025-01-17"
image: "/blog/llm-caching.jpg"
tags: ["caching", "optimization", "cost-reduction", "performance", "redis"]
---

# LLM Caching: Save 40% on OpenAI and Anthropic Costs

Caching is the easiest way to cut LLM costs. If you're making the same API calls twice, you're wasting money. Here's how to implement effective caching.

## Why Cache LLM Responses?

**Average savings:** 20-40% on API costs
**Bonus:** 10x faster response times
**Implementation time:** 30 minutes

### Real Example

**Without caching:**
- 10,000 requests/day
- 30% are duplicates
- Cost: $300/month

**With caching:**
- 7,000 unique requests
- 3,000 served from cache
- Cost: $210/month
- **Savings: $90/month ($1,080/year)**

## Types of LLM Caching

### 1. Exact Match Caching

Cache identical prompts and return the same response.

**Best for:**
- FAQ systems
- Product descriptions
- Common queries
- Static content generation

**Implementation:**

```javascript
import { createClient } from 'redis';
import crypto from 'crypto';

const redis = createClient();

async function getCachedResponse(prompt) {
  const key = crypto.createHash('md5').update(prompt).digest('hex');
  const cached = await redis.get(`llm:${key}`);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Call LLM
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });
  
  // Cache for 1 hour
  await redis.setex(`llm:${key}`, 3600, JSON.stringify(response));
  
  return response;
}
```

**Cache hit rate:** 15-30% for typical applications

### 2. Semantic Caching

Cache similar prompts, not just exact matches.

**Best for:**
- Customer support (similar questions)
- Search queries
- Paraphrased requests

**Example:**
- "How do I reset my password?" 
- "What's the process for password reset?"
- "I forgot my password, help"

All three get the same cached response.

**Implementation:**

```javascript
import { CostLens } from 'optirelay';

const client = new CostLens({
  apiKey: process.env.OPTIRELAY_API_KEY,
  cache: {
    type: 'semantic',
    similarity: 0.95, // 95% similarity threshold
    ttl: 3600
  }
});

// Automatically uses semantic caching
const response = await client.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: prompt }]
});
```

**Cache hit rate:** 40-60% for typical applications

### 3. Prompt Caching (Anthropic)

Anthropic's native prompt caching for long contexts.

**Best for:**
- Long documents (>10K tokens)
- Repeated system prompts
- RAG applications

**Pricing:**
- Cached input tokens: 50% discount
- Cache writes: 25% markup
- Break-even: 2+ uses

**Manual Implementation Challenges:**
- Requires adding cache control markers to every prompt
- Must manage cache ordering (cached content must be first)
- Need to track cache hit rates manually
- Complex to calculate actual ROI

**The Easier Way:**

CostLens handles Anthropic's prompt caching automatically without manual configuration:

```javascript
import { CostLens } from 'costlens';

const client = new CostLens({
  apiKey: process.env.COSTLENS_API_KEY,
  enableCache: true,
});

// Automatic caching - no cache_control markers needed
const response = await client.chat({
  messages: [
    { role: 'system', content: 'Long system prompt here...' },
    { role: 'user', content: 'Question' }
  ]
});
```

**Savings:** 30-50% for long-context applications with zero configuration

## Cache Strategy by Use Case

### Customer Support Chatbot
- **Strategy:** Semantic caching
- **TTL:** 24 hours
- **Expected hit rate:** 50%
- **Savings:** 40%

### Content Generation
- **Strategy:** Exact match caching
- **TTL:** 7 days
- **Expected hit rate:** 20%
- **Savings:** 15%

### Document Analysis
- **Strategy:** Prompt caching (Anthropic)
- **TTL:** 5 minutes
- **Expected hit rate:** 80%
- **Savings:** 50%

### Real-time Chat
- **Strategy:** No caching (responses must be unique)
- **Alternative:** Cache common responses only

## Cache Invalidation Strategies

### Time-based (TTL)
```javascript
// Short TTL for dynamic content
cache.setex(key, 300, value); // 5 minutes

// Long TTL for static content
cache.setex(key, 86400, value); // 24 hours
```

### Event-based
```javascript
// Invalidate when data changes
async function updateProduct(id, data) {
  await db.products.update(id, data);
  await cache.del(`product:${id}:*`); // Clear all cached responses
}
```

### LRU (Least Recently Used)
```javascript
// Redis automatically evicts old entries
redis.config('maxmemory-policy', 'allkeys-lru');
```

## Common Caching Mistakes

### ❌ Mistake 1: Caching Everything
Not all responses should be cached. Don't cache:
- Personalized responses
- Time-sensitive data
- User-specific content

### ❌ Mistake 2: TTL Too Long
Stale data = bad user experience. Balance freshness vs cost.

### ❌ Mistake 3: No Cache Warming
Pre-populate cache with common queries during off-peak hours.

### ❌ Mistake 4: Ignoring Cache Size
Monitor cache memory usage. Set limits to prevent OOM errors.

## Advanced: Multi-tier Caching

```javascript
// L1: In-memory (fastest)
const memoryCache = new Map();

// L2: Redis (fast)
const redis = createClient();

// L3: LLM API (slowest, most expensive)
async function getResponse(prompt) {
  // Check L1
  if (memoryCache.has(prompt)) {
    return memoryCache.get(prompt);
  }
  
  // Check L2
  const cached = await redis.get(prompt);
  if (cached) {
    memoryCache.set(prompt, cached); // Promote to L1
    return cached;
  }
  
  // Call LLM
  const response = await llm.complete(prompt);
  
  // Store in both caches
  memoryCache.set(prompt, response);
  await redis.setex(prompt, 3600, response);
  
  return response;
}
```

**Performance:**
- L1 hit: <1ms
- L2 hit: 5-10ms
- L3 miss: 500-2000ms

## Monitoring Cache Performance

Track these metrics:

```javascript
const metrics = {
  hits: 0,
  misses: 0,
  hitRate: () => metrics.hits / (metrics.hits + metrics.misses),
  savings: () => metrics.hits * averageCostPerRequest
};

// Log every hour
setInterval(() => {
  console.log(`Cache hit rate: ${metrics.hitRate() * 100}%`);
  console.log(`Estimated savings: $${metrics.savings()}`);
}, 3600000);
```

## CostLens: Automatic Caching

Don't want to build this yourself? CostLens handles it automatically:

```javascript
import { CostLens } from 'optirelay';

const client = new CostLens({
  apiKey: process.env.OPTIRELAY_API_KEY,
  cache: true // That's it!
});
```

**Features:**
- ✅ Semantic caching
- ✅ Automatic TTL optimization
- ✅ Multi-tier caching
- ✅ Cache analytics dashboard
- ✅ Works with OpenAI, Anthropic, and more

## Conclusion

Caching is the lowest-hanging fruit for LLM cost optimization:
- Easy to implement (30 minutes)
- Immediate savings (20-40%)
- Better performance (10x faster)
- No quality trade-offs

Start with exact match caching, then add semantic caching for bigger savings.

---

**Want automatic caching?** [Try CostLens free](https://optirelay.com) - caching included out of the box.
