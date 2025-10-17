---
title: "RAG Pipeline Costs: A Complete Breakdown"
subtitle: "Understanding where your money goes in Retrieval-Augmented Generation systems"
excerpt: "RAG systems have hidden costs most developers miss. Here's a transparent breakdown of what you're actually paying for."
tags: ["rag", "cost-optimization", "embeddings", "vector-database"]
readTime: 10
publishedAt: "2025-01-15"
---

Retrieval-Augmented Generation (RAG) has become the standard architecture for building AI applications with custom knowledge. But the cost structure is more complex than simple LLM calls.

Let me break down exactly where your money goes—with real numbers from production systems.

## The RAG Cost Stack

A typical RAG request involves multiple billable operations:

**1. Embedding Generation**
**2. Vector Database Query**
**3. LLM Inference**
**4. (Optional) Reranking**

Each layer has its own pricing model. Let's examine them.

## Embedding Costs: The Hidden Tax

Every document you index and every query you process requires embeddings.

**OpenAI text-embedding-3-small:**
- Cost: $0.02 per 1M tokens
- Dimensions: 1536
- Speed: ~500ms per batch

**OpenAI text-embedding-3-large:**
- Cost: $0.13 per 1M tokens
- Dimensions: 3072
- Speed: ~800ms per batch

**Example calculation:**
- 10,000 documents @ 500 tokens each = 5M tokens
- Initial indexing: $0.10 (small) or $0.65 (large)
- 100K queries @ 50 tokens each = 5M tokens
- Query embeddings: $0.10 (small) or $0.65 (large) monthly

**Key insight:** Embedding costs are usually negligible compared to LLM inference. Don't over-optimize here.

## Vector Database Costs

**Pinecone (Serverless):**
- Read: $0.30 per 1M queries
- Write: $2.00 per 1M writes
- Storage: $0.25 per GB/month

**Typical usage (100K queries/month):**
- Queries: $0.03
- Storage (1GB): $0.25
- **Total: ~$0.30/month**

**Weaviate Cloud:**
- Starts at $25/month for small deployments
- Scales based on memory and CPU

**Self-hosted (AWS):**
- t3.medium: ~$30/month
- Storage: ~$10/month for 100GB
- **Total: ~$40/month**

**Key insight:** Vector DB costs are predictable and relatively low. Storage and queries are cheap—compute for reranking is where costs can spike.

## LLM Inference: The Real Cost

This is where 90%+ of your RAG costs come from.

**Typical RAG prompt structure:**
- System prompt: 200 tokens
- Retrieved context: 2,000 tokens (3-5 chunks)
- User query: 100 tokens
- **Total input: 2,300 tokens**

**Output:** ~500 tokens average

**Cost per query (Claude 3.5 Sonnet):**
- Input: 2,300 tokens × $3/M = $0.0069
- Output: 500 tokens × $15/M = $0.0075
- **Total: $0.0144 per query**

**At 100K queries/month: $1,440**

**Cost per query (GPT-4o):**
- Input: 2,300 tokens × $5/M = $0.0115
- Output: 500 tokens × $15/M = $0.0075
- **Total: $0.019 per query**

**At 100K queries/month: $1,900**

## The Context Size Problem

More context = better answers, but exponentially higher costs.

**3 chunks (2K tokens):**
- Cost: $0.0144/query
- Quality: Good for simple questions

**10 chunks (6K tokens):**
- Cost: $0.0258/query (79% more expensive)
- Quality: Better for complex questions

**20 chunks (12K tokens):**
- Cost: $0.0468/query (225% more expensive)
- Quality: Best for comprehensive answers

**Key decision:** Find the minimum context that maintains quality. Every extra chunk costs you.

## Reranking: Optional but Powerful

Reranking improves relevance by scoring retrieved chunks before sending to the LLM.

**Cohere Rerank API:**
- Cost: $1.00 per 1,000 searches
- Typical usage: Rerank 20 candidates, return top 5

**Cost impact:**
- 100K queries: $100/month
- Benefit: Better context = fewer tokens needed

**ROI calculation:**
If reranking lets you use 3 chunks instead of 5:
- Savings: ~$0.006 per query
- Cost: $0.001 per query
- **Net savings: $0.005 per query = $500/month**

Reranking often pays for itself.

## Real-World Cost Breakdown

**Customer support chatbot (100K queries/month):**

```
Embeddings (queries):        $0.10
Vector DB (Pinecone):         $0.30
Reranking (Cohere):          $100.00
LLM (Claude 3.5 Sonnet):   $1,440.00
--------------------------------
Total:                     $1,540.30/month
```

**LLM inference = 93.5% of total cost.**

## Optimization Strategies

### 1. Reduce Retrieved Context

**Before:** Retrieve 10 chunks, send all to LLM
**After:** Retrieve 10 chunks, rerank, send top 3

**Savings:** ~40% on LLM costs
**Implementation:**

```typescript
// Retrieve more candidates
const candidates = await vectorDB.query(embedding, { topK: 10 });

// Rerank to find best 3
const reranked = await cohere.rerank({
  query: userQuery,
  documents: candidates,
  topN: 3,
});

// Send only top 3 to LLM
const context = reranked.results.map(r => r.document).join('\n');
```

### 2. Cache System Prompts

If your system prompt and instructions are constant, cache them.

**With Anthropic's prompt caching:**
- System prompt: 200 tokens
- First request: $0.00075 (write)
- Subsequent: $0.000075 (read, 90% discount)

**Savings:** Minimal per query, but adds up at scale.

### 3. Smart Model Selection

Not every query needs your most expensive model.

**Simple queries (FAQ, definitions):**
- Use Claude 3 Haiku: $0.00025 input / $0.00125 output
- Savings: ~85% vs Claude 3.5 Sonnet

**Complex queries (analysis, reasoning):**
- Use Claude 3.5 Sonnet or GPT-4o
- Quality justifies the cost

Learn more about [choosing between GPT-4o and Claude 3.5 Sonnet](/blog/gpt-4o-vs-claude-3-5-sonnet-2024) for different use cases.

**Implementation with CostLens:**

```typescript
import { CostLens } from 'costlens';

const client = new CostLens({
  apiKey: process.env.COSTLENS_API_KEY,
  smartRouting: true,
});

// CostLens analyzes query complexity and routes appropriately
const response = await client.chat({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Context: ${context}\n\nQuestion: ${query}` }
  ],
});
```

### 4. Implement Response Caching

Many queries are similar or identical.

**Strategy:**
- Hash: query + retrieved chunk IDs
- Cache: LLM response
- TTL: 1-24 hours depending on use case

**Typical cache hit rate:** 30-50%
**Savings:** 30-50% on LLM costs

```typescript
import { CostLens } from 'costlens';

const client = new CostLens({
  apiKey: process.env.COSTLENS_API_KEY,
  enableCache: true,
  cacheTTL: 3600, // 1 hour
});

// Automatic caching of similar queries
const response = await client.chat({
  messages: [...],
});
```

## Cost Monitoring

Track these metrics:

**1. Cost per query**
- Target: < $0.01 for simple RAG
- Alert if: > $0.02

**2. Average context size**
- Target: 2,000-3,000 tokens
- Alert if: > 5,000 tokens

**3. Cache hit rate**
- Target: > 40%
- Alert if: < 20%

**4. Model distribution**
- Target: 70% cheap models, 30% expensive
- Alert if: > 50% expensive models

## Real Customer Example

**SaaS documentation chatbot:**

**Before optimization:**
- 50K queries/month
- Average 8 chunks per query (5K tokens)
- Claude 3.5 Sonnet for all queries
- Cost: $1,150/month

**After optimization:**
- Reranking: 10 candidates → top 3 chunks
- Smart routing: 65% Haiku, 35% Sonnet
- Response caching: 42% hit rate
- Cost: $340/month

**Savings: $810/month ($9,720 annually)**

## The Bottom Line

**RAG cost hierarchy:**
1. LLM inference: 90-95% of costs
2. Reranking: 3-7% (but often worth it)
3. Vector DB: 1-2%
4. Embeddings: <1%

**Focus your optimization efforts on:**
- Reducing context size (biggest impact)
- Smart model selection (easy wins)
- Response caching (high ROI)
- Reranking (improves quality + reduces tokens)

**Don't waste time on:**
- Switching embedding models (negligible savings)
- Over-optimizing vector DB queries (already cheap)

Track your costs with CostLens to see exactly where your money goes. Most teams discover they can cut RAG costs by 50-70% without sacrificing quality.
