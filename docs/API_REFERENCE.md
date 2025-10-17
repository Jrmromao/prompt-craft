# API Reference

Complete reference for the CostLens SDK and REST API.

## SDK Reference

### Installation

```bash
npm install costlens
```

### Constructor

```typescript
new CostLens(config: CostLensConfig)
```

**Parameters:**
- `config.apiKey` (string, required) - Your CostLens API key
- `config.baseUrl` (string, optional) - Custom base URL (default: `https://costlens.dev`)

**Example:**
```typescript
const costlens = new CostLens({
  apiKey: 'cl_your_api_key_here',
  baseUrl: 'https://api.costlens.dev' // optional
});
```

### Methods

#### trackOpenAI()

Track an OpenAI API call.

```typescript
trackOpenAI(
  params: OpenAI.Chat.ChatCompletionCreateParams,
  result: OpenAI.Chat.ChatCompletion,
  latency: number
): Promise<void>
```

**Parameters:**
- `params` - The parameters passed to OpenAI
- `result` - The response from OpenAI
- `latency` - Time taken in milliseconds

**Example:**
```typescript
const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);
```

#### trackAnthropic()

Track an Anthropic (Claude) API call.

```typescript
trackAnthropic(
  params: Anthropic.MessageCreateParams,
  result: Anthropic.Message,
  latency: number
): Promise<void>
```

**Parameters:**
- `params` - The parameters passed to Anthropic
- `result` - The response from Anthropic
- `latency` - Time taken in milliseconds

**Example:**
```typescript
const start = Date.now();
const result = await anthropic.messages.create(params);
await promptcraft.trackAnthropic(params, result, Date.now() - start);
```

#### trackError()

Track a failed API call.

```typescript
trackError(
  model: string,
  input: string,
  error: Error,
  latency: number
): Promise<void>
```

**Parameters:**
- `model` - The model that was attempted (e.g., 'gpt-4')
- `input` - The input that was sent
- `error` - The error object
- `latency` - Time taken before failure

**Example:**
```typescript
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, latency);
} catch (error) {
  await promptcraft.trackError(params.model, JSON.stringify(params.messages), error, latency);
  throw error;
}
```

## REST API

Base URL: `https://promptcraft.app/api`

### Authentication

All API requests require authentication via API key in the Authorization header:

```
Authorization: Bearer pc_your_api_key_here
```

### Endpoints

#### POST /integrations/run

Track an AI API call.

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "input": "{\"messages\":[...]}",
  "output": "Hello! How can I help you?",
  "tokensUsed": 150,
  "latency": 1234,
  "success": true,
  "promptId": "greeting-v1"
}
```

**Response:**
```json
{
  "success": true,
  "runId": "run_abc123"
}
```

**Rate Limits:**
- Free: 10 requests/minute
- Starter: 60 requests/minute
- Pro: 300 requests/minute
- Enterprise: 1,000 requests/minute

**Errors:**
- `401` - Invalid or missing API key
- `402` - Monthly run limit exceeded
- `429` - Rate limit exceeded
- `500` - Server error

#### GET /analytics/overview

Get analytics overview.

**Query Parameters:**
- `startDate` (ISO 8601) - Start date for analytics
- `endDate` (ISO 8601) - End date for analytics

**Response:**
```json
{
  "totalRuns": 1234,
  "totalCost": 45.67,
  "totalTokens": 123456,
  "avgCostPerRun": 0.037,
  "successRate": 98.5,
  "avgLatency": 1234
}
```

#### GET /usage

Get current usage stats.

**Response:**
```json
{
  "plan": "free",
  "runsThisMonth": 234,
  "runsLimit": 1000,
  "percentUsed": 23.4
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 401 | Unauthorized - Invalid API key |
| 402 | Payment Required - Upgrade needed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limits

Rate limits are per API key:

| Plan | Requests/Minute |
|------|----------------|
| Free | 10 |
| Starter | 60 |
| Pro | 300 |
| Enterprise | 1,000 |

When rate limited, you'll receive:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Webhooks (Coming Soon)

Subscribe to events:
- `run.completed` - When a run is tracked
- `limit.approaching` - When nearing monthly limit
- `limit.exceeded` - When limit is exceeded

## SDK Types

### PromptCraftConfig

```typescript
interface PromptCraftConfig {
  apiKey: string;
  baseUrl?: string;
}
```

### TrackRunData

```typescript
interface TrackRunData {
  promptId?: string;
  model: string;
  input: string;
  output: string;
  tokensUsed: number;
  latency: number;
  success: boolean;
  error?: string;
}
```

## Cost Calculation

Costs are calculated based on official pricing:

### OpenAI
- GPT-4: $0.03 per 1K tokens
- GPT-3.5-Turbo: $0.0005 per 1K tokens

### Anthropic
- Claude 3 Opus: $0.015 per 1K tokens
- Claude 3 Sonnet: $0.003 per 1K tokens
- Claude 3 Haiku: $0.00025 per 1K tokens

Prices are updated automatically when providers change their pricing.
