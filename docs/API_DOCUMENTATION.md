# CostLens.dev API Documentation

## Overview

The CostLens.dev API provides programmatic access to all cost tracking features including AI cost analytics, budget monitoring, usage reports, and team collaboration.

**Base URL**: `https://api.costlens.dev`
**API Version**: `v1`
**Authentication**: Bearer token (Clerk session)

## Authentication

All API requests require authentication using Clerk session tokens:

```bash
curl -H "Authorization: Bearer <clerk_session_token>" \
     https://api.costlens.dev/api/costs
```

### Getting Authentication Token
```javascript
// Frontend (Next.js)
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();

// API Request
const response = await fetch('/api/prompts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

## Rate Limiting

API requests are rate-limited based on user plan:

| Plan | Requests per minute | Burst limit |
|------|-------------------|-------------|
| Free | 60 | 100 |
| Pro | 300 | 500 |
| Elite | 1000 | 1500 |
| Enterprise | 5000 | 10000 |

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642248600
```

## Endpoints

### 1. Prompts

#### Create Prompt
```http
POST /api/prompts
```

**Request Body:**
```json
{
  "name": "Email Marketing Assistant",
  "description": "Helps create compelling marketing emails",
  "content": "Write a marketing email for [PRODUCT] targeting [AUDIENCE] with [TONE]",
  "category": "MARKETING",
  "tags": ["email", "marketing", "copywriting"],
  "isPublic": true,
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 1000,
  "examples": [
    {
      "input": "Product: SaaS tool, Audience: developers, Tone: professional",
      "output": "Subject: Streamline Your Development Workflow..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prompt_abc123",
    "name": "Email Marketing Assistant",
    "slug": "email-marketing-assistant",
    "description": "Helps create compelling marketing emails",
    "content": "Write a marketing email for [PRODUCT] targeting [AUDIENCE] with [TONE]",
    "category": "MARKETING",
    "tags": ["email", "marketing", "copywriting"],
    "isPublic": true,
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 1000,
    "userId": "user_xyz789",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "upvotes": 0,
    "downvotes": 0,
    "viewCount": 0,
    "usageCount": 0,
    "versions": [
      {
        "id": "version_def456",
        "version": "1.0.0",
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Get Prompt
```http
GET /api/prompts/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prompt_abc123",
    "name": "Email Marketing Assistant",
    "slug": "email-marketing-assistant",
    "description": "Helps create compelling marketing emails",
    "content": "Write a marketing email for [PRODUCT] targeting [AUDIENCE] with [TONE]",
    "category": "MARKETING",
    "tags": ["email", "marketing", "copywriting"],
    "isPublic": true,
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 1000,
    "userId": "user_xyz789",
    "user": {
      "id": "user_xyz789",
      "name": "John Doe",
      "imageUrl": "https://example.com/avatar.jpg"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "upvotes": 15,
    "downvotes": 2,
    "viewCount": 234,
    "usageCount": 45,
    "versions": [
      {
        "id": "version_def456",
        "version": "1.0.0",
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00Z",
        "changelog": "Initial version"
      }
    ],
    "examples": [
      {
        "input": "Product: SaaS tool, Audience: developers, Tone: professional",
        "output": "Subject: Streamline Your Development Workflow..."
      }
    ]
  }
}
```

#### List Prompts
```http
GET /api/prompts?page=1&limit=20&category=MARKETING&tags=email,marketing&sort=popular
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `category` (string): Filter by category
- `tags` (string): Comma-separated tags
- `sort` (string): Sort order (`popular`, `recent`, `trending`, `rating`)
- `search` (string): Search query
- `userId` (string): Filter by author

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prompt_abc123",
      "name": "Email Marketing Assistant",
      "slug": "email-marketing-assistant",
      "description": "Helps create compelling marketing emails",
      "category": "MARKETING",
      "tags": ["email", "marketing", "copywriting"],
      "isPublic": true,
      "userId": "user_xyz789",
      "user": {
        "name": "John Doe",
        "imageUrl": "https://example.com/avatar.jpg"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "upvotes": 15,
      "downvotes": 2,
      "viewCount": 234,
      "usageCount": 45,
      "rating": 4.2
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### Update Prompt
```http
PUT /api/prompts/{id}
```

**Request Body:**
```json
{
  "name": "Updated Email Marketing Assistant",
  "description": "Enhanced version with more features",
  "content": "Write a marketing email for [PRODUCT] targeting [AUDIENCE] with [TONE] and [CTA]",
  "tags": ["email", "marketing", "copywriting", "conversion"]
}
```

#### Delete Prompt
```http
DELETE /api/prompts/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Prompt deleted successfully"
  }
}
```

#### Test Prompt
```http
POST /api/prompts/{id}/test
```

**Request Body:**
```json
{
  "input": "Product: AI writing tool, Audience: content creators, Tone: friendly",
  "model": "gpt-4",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "input": "Product: AI writing tool, Audience: content creators, Tone: friendly",
    "output": "Subject: Transform Your Content Creation Process...",
    "tokenCount": 156,
    "responseTime": 1.2,
    "cost": 5,
    "model": "gpt-4",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### Vote on Prompt
```http
POST /api/prompts/{id}/vote
```

**Request Body:**
```json
{
  "value": 1  // 1 for upvote, -1 for downvote, 0 to remove vote
}
```

### 2. User Management

#### Get User Profile
```http
GET /api/user/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_xyz789",
    "clerkId": "clerk_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "imageUrl": "https://example.com/avatar.jpg",
    "bio": "AI enthusiast and prompt engineer",
    "website": "https://johndoe.com",
    "planType": "PRO",
    "role": "USER",
    "monthlyCredits": 500,
    "purchasedCredits": 100,
    "usedCredits": 150,
    "createdAt": "2025-01-01T00:00:00Z",
    "stats": {
      "promptsCreated": 25,
      "totalUpvotes": 340,
      "totalViews": 5600,
      "followers": 45,
      "following": 23
    }
  }
}
```

#### Update User Profile
```http
PUT /api/user/profile
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Updated bio",
  "website": "https://johnsmith.com"
}
```

#### Get User's Prompts
```http
GET /api/user/prompts?page=1&limit=20&visibility=all
```

**Query Parameters:**
- `visibility` (string): `all`, `public`, `private`
- `page`, `limit`: Pagination

### 3. Subscription Management

#### Get Current Subscription
```http
GET /api/subscription/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "planType": "PRO",
    "status": "ACTIVE",
    "currentPeriodStart": "2025-01-01T00:00:00Z",
    "currentPeriodEnd": "2025-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "stripeSubscriptionId": "sub_abc123",
    "features": {
      "monthlyCredits": 500,
      "maxPrivatePrompts": 50,
      "aiModels": ["gpt-3.5-turbo", "gpt-4", "deepseek"],
      "teamMembers": 3,
      "apiAccess": true,
      "prioritySupport": false
    },
    "usage": {
      "creditsUsed": 150,
      "creditsRemaining": 450,
      "privatePromptsUsed": 12,
      "privatePromptsRemaining": 38
    }
  }
}
```

#### Create Checkout Session
```http
POST /api/subscription/checkout
```

**Request Body:**
```json
{
  "planType": "ELITE",
  "billingCycle": "monthly",
  "successUrl": "https://app.promptcraft.com/settings/billing?success=true",
  "cancelUrl": "https://app.promptcraft.com/settings/billing?canceled=true"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_abc123",
    "sessionId": "cs_abc123"
  }
}
```

#### Cancel Subscription
```http
POST /api/subscription/cancel
```

**Request Body:**
```json
{
  "cancelAtPeriodEnd": true,
  "reason": "Too expensive"
}
```

### 4. Credit Management

#### Get Credit Balance
```http
GET /api/credits/balance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyCredits": 500,
    "purchasedCredits": 100,
    "totalCredits": 600,
    "usedCredits": 150,
    "remainingCredits": 450,
    "nextResetDate": "2025-02-01T00:00:00Z",
    "usage": {
      "thisMonth": 150,
      "lastMonth": 420,
      "average": 285
    }
  }
}
```

#### Purchase Credits
```http
POST /api/credits/purchase
```

**Request Body:**
```json
{
  "packageId": "credits_500",
  "successUrl": "https://app.promptcraft.com/dashboard?credits=purchased",
  "cancelUrl": "https://app.promptcraft.com/settings/billing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_def456",
    "sessionId": "cs_def456",
    "package": {
      "credits": 500,
      "bonus": 100,
      "total": 600,
      "price": 2000
    }
  }
}
```

#### Get Credit Usage History
```http
GET /api/credits/usage?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsed": 150,
    "breakdown": [
      {
        "date": "2025-01-15",
        "promptId": "prompt_abc123",
        "promptName": "Email Marketing Assistant",
        "model": "gpt-4",
        "credits": 5,
        "tokenCount": 156
      }
    ],
    "dailyUsage": [
      {
        "date": "2025-01-15",
        "credits": 25
      }
    ]
  }
}
```

### 5. Community Features

#### Get Comments
```http
GET /api/prompts/{id}/comments?page=1&limit=20&sort=recent
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment_abc123",
      "content": "Great prompt! Very helpful for my marketing campaigns.",
      "userId": "user_def456",
      "user": {
        "name": "Jane Smith",
        "imageUrl": "https://example.com/avatar2.jpg"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z",
      "parentId": null,
      "replies": [],
      "likes": 5
    }
  ]
}
```

#### Create Comment
```http
POST /api/prompts/{id}/comments
```

**Request Body:**
```json
{
  "content": "This prompt works perfectly for my use case!",
  "parentId": null  // Optional, for replies
}
```

#### Follow User
```http
POST /api/users/{id}/follow
```

**Response:**
```json
{
  "success": true,
  "data": {
    "following": true,
    "followerCount": 46
  }
}
```

#### Get Following Feed
```http
GET /api/user/feed?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "PROMPT_CREATED",
      "timestamp": "2025-01-15T10:30:00Z",
      "user": {
        "id": "user_abc123",
        "name": "John Doe",
        "imageUrl": "https://example.com/avatar.jpg"
      },
      "prompt": {
        "id": "prompt_def456",
        "name": "New Marketing Prompt",
        "description": "Latest marketing automation prompt"
      }
    }
  ]
}
```

### 6. Search & Discovery

#### Search Prompts
```http
GET /api/search/prompts?q=marketing&category=MARKETING&tags=email&sort=relevance&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "prompt_abc123",
        "name": "Email Marketing Assistant",
        "description": "Helps create compelling marketing emails",
        "category": "MARKETING",
        "tags": ["email", "marketing", "copywriting"],
        "user": {
          "name": "John Doe",
          "imageUrl": "https://example.com/avatar.jpg"
        },
        "upvotes": 15,
        "rating": 4.2,
        "relevanceScore": 0.95
      }
    ],
    "suggestions": ["email automation", "marketing copy", "sales emails"],
    "filters": {
      "categories": [
        {"name": "MARKETING", "count": 45},
        {"name": "COPYWRITING", "count": 23}
      ],
      "tags": [
        {"name": "email", "count": 67},
        {"name": "marketing", "count": 89}
      ]
    }
  }
}
```

#### Get Trending Prompts
```http
GET /api/prompts/trending?timeframe=week&limit=10
```

**Query Parameters:**
- `timeframe`: `day`, `week`, `month`, `all`
- `limit`: Number of results (max 50)

### 7. Analytics

#### Get Prompt Analytics
```http
GET /api/prompts/{id}/analytics?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "views": {
      "total": 1250,
      "unique": 890,
      "daily": [
        {"date": "2025-01-15", "views": 45, "unique": 32}
      ]
    },
    "usage": {
      "total": 234,
      "successful": 220,
      "failed": 14,
      "successRate": 0.94
    },
    "engagement": {
      "upvotes": 15,
      "downvotes": 2,
      "comments": 8,
      "shares": 3,
      "forks": 5
    },
    "performance": {
      "avgResponseTime": 1.2,
      "avgTokenCount": 156,
      "avgCost": 5.2
    }
  }
}
```

#### Get User Analytics
```http
GET /api/user/analytics?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": {
      "created": 5,
      "totalViews": 2340,
      "totalUsage": 456,
      "totalUpvotes": 67
    },
    "engagement": {
      "commentsReceived": 23,
      "newFollowers": 12,
      "profileViews": 145
    },
    "credits": {
      "earned": 25,
      "spent": 150,
      "balance": 450
    }
  }
}
```

### 8. Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/admin/users?page=1&limit=50&role=USER&status=ACTIVE&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "planType": "PRO",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLoginAt": "2025-01-15T10:30:00Z",
      "stats": {
        "promptsCreated": 25,
        "creditsUsed": 150,
        "totalRevenue": 2000
      }
    }
  ]
}
```

#### Update User Role (Admin Only)
```http
PUT /api/admin/users/{id}/role
```

**Request Body:**
```json
{
  "role": "MODERATOR"
}
```

#### Get System Metrics (Admin Only)
```http
GET /api/admin/metrics?timeframe=week
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 5420,
      "active": 3240,
      "new": 156
    },
    "prompts": {
      "total": 12340,
      "public": 8900,
      "created": 234
    },
    "revenue": {
      "mrr": 15600,
      "arr": 187200,
      "growth": 0.12
    },
    "usage": {
      "creditsConsumed": 234000,
      "apiRequests": 1240000,
      "avgResponseTime": 1.2
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | Missing or invalid authentication |
| `AUTHORIZATION_FAILED` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INSUFFICIENT_CREDITS` | Not enough credits for operation |
| `PLAN_LIMIT_EXCEEDED` | Plan usage limit reached |
| `CONTENT_MODERATION_FAILED` | Content violates guidelines |
| `PAYMENT_REQUIRED` | Payment method required |
| `SERVER_ERROR` | Internal server error |

## SDKs and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @promptcraft/sdk
```

```typescript
import { PromptCraftAPI } from '@promptcraft/sdk';

const api = new PromptCraftAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.promptcraft.com'
});

// Create a prompt
const prompt = await api.prompts.create({
  name: 'My Prompt',
  content: 'Write about [TOPIC]',
  isPublic: true
});

// Test a prompt
const result = await api.prompts.test(prompt.id, {
  input: 'TOPIC: artificial intelligence'
});
```

### Python SDK
```bash
pip install promptcraft-python
```

```python
from promptcraft import PromptCraftAPI

api = PromptCraftAPI(api_key='your-api-key')

# Create a prompt
prompt = api.prompts.create(
    name='My Prompt',
    content='Write about [TOPIC]',
    is_public=True
)

# Test a prompt
result = api.prompts.test(
    prompt_id=prompt.id,
    input='TOPIC: artificial intelligence'
)
```

## Webhooks

PromptCraft can send webhooks for various events:

### Webhook Events
- `prompt.created`
- `prompt.updated`
- `prompt.deleted`
- `user.subscribed`
- `user.unsubscribed`
- `comment.created`
- `vote.created`

### Webhook Payload Example
```json
{
  "event": "prompt.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": "prompt_abc123",
    "name": "New Prompt",
    "userId": "user_xyz789",
    "isPublic": true
  }
}
```

### Webhook Configuration
```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/promptcraft",
  "events": ["prompt.created", "user.subscribed"],
  "secret": "your-webhook-secret"
}
```

This comprehensive API documentation provides all the necessary information for developers to integrate with the PromptCraft platform.
