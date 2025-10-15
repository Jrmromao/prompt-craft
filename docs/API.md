# API Documentation

## Authentication

All API requests require authentication via Bearer token:

```bash
Authorization: Bearer YOUR_API_KEY
```

Get your API key from the dashboard at `/settings/api-keys`.

## Endpoints

### Track Run

Record an AI API call for tracking and analytics.

**Endpoint:** `POST /api/integrations/run`

**Request:**
```json
{
  "promptId": "customer-support",
  "model": "gpt-4",
  "provider": "openai",
  "input": "User question here",
  "output": "AI response here",
  "tokensUsed": 150,
  "latency": 1200,
  "success": true
}
```

**Response:**
```json
{
  "success": true
}
```

**Error Codes:**
- `401` - Unauthorized (invalid API key)
- `429` - Rate limit exceeded
- `402` - Usage limit reached (upgrade plan)

---

### Get Analytics Overview

Get aggregated analytics for a time period.

**Endpoint:** `GET /api/analytics/overview`

**Query Parameters:**
- `startDate` (ISO 8601) - Start of period
- `endDate` (ISO 8601) - End of period

**Response:**
```json
{
  "totalRuns": 1500,
  "totalCost": 45.67,
  "totalTokens": 150000,
  "avgCostPerRun": 0.0304,
  "successRate": 98.5,
  "avgLatency": 1250,
  "periodComparison": {
    "runs": 200,
    "cost": 5.43
  }
}
```

---

### Get Model Breakdown

See cost and performance by model.

**Endpoint:** `GET /api/analytics/models`

**Response:**
```json
[
  {
    "model": "gpt-4",
    "runs": 500,
    "cost": 30.50,
    "tokens": 50000,
    "avgCost": 0.061,
    "successRate": 99.2
  }
]
```

---

### Export Data

Export analytics data in various formats.

**Endpoint:** `GET /api/export`

**Query Parameters:**
- `format` - `json`, `csv`, or `report`
- `days` - Number of days to export (default: 30)

**CSV Response:**
```csv
Date,Prompt ID,Model,Provider,Tokens,Cost,Latency,Success
2024-01-15T10:30:00Z,greeting,gpt-4,openai,50,0.0015,1200,Yes
```

---

### Create Alert

Set up cost or performance alerts.

**Endpoint:** `POST /api/alerts`

**Request:**
```json
{
  "type": "COST_SPIKE",
  "threshold": 100
}
```

**Alert Types:**
- `COST_SPIKE` - Daily cost exceeds threshold (in dollars)
- `HIGH_ERROR_RATE` - Error rate exceeds threshold (percentage)
- `SLOW_RESPONSE` - Average latency exceeds threshold (milliseconds)

---

### Team Management

Invite team members to share analytics.

**Endpoint:** `POST /api/team`

**Request:**
```json
{
  "email": "teammate@example.com",
  "role": "MEMBER"
}
```

**Roles:**
- `ADMIN` - Full access, can manage team
- `MEMBER` - View-only access

---

## Rate Limits

| Plan | Requests/minute |
|------|-----------------|
| Free | 10 |
| Starter | 60 |
| Pro | 300 |
| Enterprise | 1000 |

## Webhooks

Configure webhooks to receive real-time notifications.

**Events:**
- `alert.triggered` - Alert threshold exceeded
- `limit.reached` - Usage limit reached
- `export.completed` - Data export ready

**Payload:**
```json
{
  "event": "alert.triggered",
  "data": {
    "alertId": "alert_123",
    "type": "COST_SPIKE",
    "threshold": 100,
    "actual": 125.50
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```
