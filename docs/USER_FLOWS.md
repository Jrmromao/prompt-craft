# PromptCraft User Flows & Technical Specifications

## 1. User Registration & Onboarding Flow

### Flow Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Landing   │───▶│   Sign Up   │───▶│ Verification│───▶│   Profile   │
│    Page     │    │    (Clerk)  │    │   (Email)   │    │    Setup    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  Dashboard  │◀───│   Welcome   │◀───│    Plan     │◀──────────┘
│   (Main)    │    │   Modal     │    │  Selection  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Technical Implementation

#### 1.1 Registration Process
**Endpoint**: `/sign-up`
**Components**: 
- `SignUpForm` (Clerk component)
- `EmailVerification` (Clerk component)

**Database Operations**:
```sql
-- User creation triggered by Clerk webhook
INSERT INTO "User" (
  "clerkId", "email", "name", "planType", "monthlyCredits"
) VALUES (
  $1, $2, $3, 'FREE', 50
);
```

#### 1.2 Profile Setup
**Component**: `ProfileSetupForm`
**Fields**:
- Display Name (required)
- Bio (optional, max 500 chars)
- Website (optional, URL validation)
- Avatar Upload (optional, max 5MB)

**Validation Schema**:
```typescript
const profileSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  avatar: z.string().url().optional(),
});
```

#### 1.3 Plan Selection
**Component**: `PlanSelector`
**Default**: FREE plan (50 credits/month)
**Options**: Immediate upgrade or skip to dashboard

## 2. Prompt Creation Flow

### Detailed Flow Diagram
```
Dashboard ──▶ Create Button ──▶ Editor Interface
    │                              │
    │         ┌────────────────────┘
    │         │
    ▼         ▼
Plan Check ──▶ Form Validation ──▶ Auto-save (Draft)
    │                              │
    │         ┌────────────────────┘
    │         │
    ▼         ▼
Test Prompt ──▶ AI Generation ──▶ Credit Deduction
    │                              │
    │         ┌────────────────────┘
    │         │
    ▼         ▼
Publish ──▶ Version Creation ──▶ Search Indexing
```

### 2.1 Prompt Editor Interface

**Component**: `PromptEditor`
**Location**: `/prompts/create`

**Form Structure**:
```typescript
interface PromptFormData {
  // Basic Information
  name: string;                    // 1-100 characters
  description: string;             // 0-500 characters
  category: PromptCategory;        // Enum selection
  tags: string[];                  // Max 10 tags
  
  // Prompt Content
  content: string;                 // The actual prompt text
  systemMessage?: string;          // Optional system context
  examples: PromptExample[];       // Input/output examples
  
  // Configuration
  model: AIModel;                  // Default: 'gpt-3.5-turbo'
  temperature: number;             // 0-1, default: 0.7
  maxTokens: number;               // 1-4000, default: 1000
  
  // Publishing
  isPublic: boolean;               // Default: false
  allowComments: boolean;          // Default: true
  allowForks: boolean;             // Default: true
}
```

**Real-time Features**:
- Auto-save every 30 seconds
- Character count indicators
- Syntax highlighting for prompt variables
- Live preview of formatted prompt

### 2.2 Prompt Testing System

**Component**: `PromptTester`
**Integration**: Embedded in editor

**Test Interface**:
```typescript
interface TestConfiguration {
  userInput: string;               // Test input
  model: AIModel;                  // Override default model
  temperature?: number;            // Override temperature
  iterations: number;              // 1-5 test runs
}

interface TestResult {
  input: string;
  output: string;
  tokenCount: number;
  responseTime: number;
  cost: number;                    // Credits consumed
  model: string;
  timestamp: Date;
}
```

**Credit Calculation**:
```typescript
const CREDIT_COSTS = {
  'gpt-3.5-turbo': 1,     // 1 credit per request
  'gpt-4': 5,             // 5 credits per request
  'deepseek': 2,          // 2 credits per request
  'claude': 3,            // 3 credits per request
};
```

### 2.3 Publishing Process

**Validation Steps**:
1. **Content Validation**: Non-empty prompt, valid syntax
2. **Plan Limits**: Check private prompt quota
3. **Content Moderation**: Auto-scan for prohibited content
4. **Metadata Completion**: Required fields filled

**Database Operations**:
```sql
-- Create prompt record
INSERT INTO "Prompt" (
  "userId", "name", "content", "description", 
  "isPublic", "model", "temperature", "maxTokens"
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- Create initial version
INSERT INTO "Version" (
  "promptId", "version", "content", "changelog"
) VALUES ($1, '1.0.0', $2, 'Initial version');

-- Update search index (if public)
INSERT INTO "PromptSearchIndex" (
  "promptId", "searchVector"
) VALUES ($1, to_tsvector('english', $2 || ' ' || $3));
```

## 3. Subscription Management Flow

### 3.1 Plan Upgrade Flow
```
Current Plan ──▶ Billing Page ──▶ Plan Comparison
     │                              │
     │         ┌────────────────────┘
     │         │
     ▼         ▼
Plan Selection ──▶ Stripe Checkout ──▶ Payment Processing
     │                              │
     │         ┌────────────────────┘
     │         │
     ▼         ▼
Webhook ──▶ Plan Activation ──▶ Credit Allocation
```

### 3.2 Stripe Integration

**Checkout Session Creation**:
```typescript
// /api/subscription/checkout
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: user.stripeCustomerId,
  line_items: [{
    price: PLAN_PRICE_IDS[planType],
    quantity: 1,
  }],
  success_url: `${baseUrl}/settings/billing?success=true`,
  cancel_url: `${baseUrl}/settings/billing?canceled=true`,
  metadata: {
    userId: user.id,
    planType: planType,
  },
});
```

**Webhook Processing**:
```typescript
// /api/webhooks/stripe
const webhookHandlers = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionCanceled,
  'invoice.payment_succeeded': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed,
};
```

### 3.3 Credit System

**Monthly Credit Allocation**:
```typescript
const PLAN_CREDITS = {
  FREE: 50,
  PRO: 500,
  ELITE: 2000,
  ENTERPRISE: 10000,
};

// Reset credits on billing cycle
async function resetMonthlyCredits(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyCredits: PLAN_CREDITS[user.planType],
      creditResetDate: new Date(),
    },
  });
}
```

**Credit Purchase Flow**:
```typescript
const CREDIT_PACKAGES = [
  { credits: 100, price: 500, bonus: 0 },      // $5.00
  { credits: 500, price: 2000, bonus: 100 },  // $20.00 + 20% bonus
  { credits: 1000, price: 3500, bonus: 300 }, // $35.00 + 30% bonus
  { credits: 2500, price: 7500, bonus: 1000 }, // $75.00 + 40% bonus
];
```

## 4. Prompt Discovery & Community Flow

### 4.1 Browse & Search Flow
```
Browse Page ──▶ Filter/Search ──▶ Results List
     │                              │
     │         ┌────────────────────┘
     │         │
     ▼         ▼
Prompt View ──▶ Test/Use ──▶ Vote/Comment
     │                              │
     │         ┌────────────────────┘
     │         │
     ▼         ▼
Follow Author ──▶ Save to Collection ──▶ Fork Prompt
```

### 4.2 Search Implementation

**Search Endpoint**: `/api/prompts/search`
**Search Features**:
- Full-text search in title, description, content
- Tag-based filtering
- Category filtering
- Author filtering
- Sorting options (relevance, popularity, recent)

**Database Query**:
```sql
SELECT p.*, u.name as authorName, 
       ts_rank(psi.searchVector, plainto_tsquery($1)) as rank
FROM "Prompt" p
JOIN "User" u ON p.userId = u.id
JOIN "PromptSearchIndex" psi ON p.id = psi.promptId
WHERE p.isPublic = true
  AND psi.searchVector @@ plainto_tsquery($1)
  AND ($2::text IS NULL OR p.category = $2)
  AND ($3::text[] IS NULL OR p.tags && $3)
ORDER BY rank DESC, p.upvotes DESC
LIMIT $4 OFFSET $5;
```

### 4.3 Community Features

**Voting System**:
```typescript
interface Vote {
  id: string;
  userId: string;
  promptId: string;
  value: -1 | 1;        // Downvote or Upvote
  createdAt: Date;
}

// Vote processing with anti-abuse
async function processVote(userId: string, promptId: string, value: number) {
  // Check for existing vote
  const existingVote = await prisma.vote.findUnique({
    where: { userId_promptId: { userId, promptId } }
  });
  
  // Prevent self-voting
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
  if (prompt.userId === userId) {
    throw new Error('Cannot vote on own prompt');
  }
  
  // Process vote and update counters
  // ... implementation
}
```

**Comment System**:
```typescript
interface Comment {
  id: string;
  userId: string;
  promptId: string;
  content: string;
  parentId?: string;    // For nested comments
  hidden: boolean;      // Moderation flag
  createdAt: Date;
  updatedAt: Date;
}
```

## 5. Admin Dashboard Flow

### 5.1 Admin Navigation
```
Admin Login ──▶ Dashboard Overview ──▶ User Management
     │                                      │
     │         ┌────────────────────────────┘
     │         │
     ▼         ▼
Content Moderation ──▶ Analytics ──▶ System Settings
     │                     │              │
     │         ┌───────────┘              │
     │         │                          │
     ▼         ▼                          ▼
Abuse Reports ──▶ Performance Metrics ──▶ Feature Flags
```

### 5.2 User Management

**Admin Capabilities**:
- View all users with filtering/search
- Change user roles (USER, MODERATOR, ADMIN)
- Suspend/ban users
- View user activity logs
- Reset user passwords
- Manage subscriptions

**Role Permissions**:
```typescript
const ROLE_PERMISSIONS = {
  USER: [
    'prompts:create', 'prompts:read', 'prompts:update:own',
    'comments:create', 'votes:create'
  ],
  MODERATOR: [
    ...USER_PERMISSIONS,
    'prompts:moderate', 'comments:moderate', 'users:suspend'
  ],
  ADMIN: [
    ...MODERATOR_PERMISSIONS,
    'users:manage', 'system:configure', 'analytics:view'
  ]
};
```

### 5.3 Content Moderation

**Moderation Queue**:
- Reported prompts/comments
- Auto-flagged content
- New user submissions (if enabled)
- Appeals and disputes

**Moderation Actions**:
```typescript
enum ModerationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  HIDE = 'HIDE',
  WARN_USER = 'WARN_USER',
  SUSPEND_USER = 'SUSPEND_USER',
  BAN_USER = 'BAN_USER'
}
```

## 6. Security & Monitoring Flow

### 6.1 Security Event Processing
```
User Action ──▶ Security Middleware ──▶ Event Detection
     │                                      │
     │         ┌────────────────────────────┘
     │         │
     ▼         ▼
Audit Logging ──▶ Threat Analysis ──▶ Alert Generation
     │                     │              │
     │         ┌───────────┘              │
     │         │                          │
     ▼         ▼                          ▼
Database Storage ──▶ Pattern Recognition ──▶ Admin Notification
```

### 6.2 Monitoring Dashboard

**Key Metrics**:
- Active users (daily/monthly)
- Prompt creation rate
- Credit consumption
- API response times
- Error rates
- Security events

**Alert Thresholds**:
```typescript
const ALERT_THRESHOLDS = {
  ERROR_RATE: 0.05,           // 5% error rate
  RESPONSE_TIME: 2000,        // 2 second response time
  FAILED_LOGINS: 10,          // 10 failed logins per hour
  CREDIT_ABUSE: 1000,         // 1000 credits per hour per user
  SYSTEM_LOAD: 0.8,           // 80% system utilization
};
```

## 7. Mobile & PWA Considerations

### 7.1 Responsive Design Breakpoints
```css
/* Mobile First Approach */
.container {
  /* Mobile: 320px - 768px */
  padding: 1rem;
}

@media (min-width: 768px) {
  /* Tablet: 768px - 1024px */
  .container {
    padding: 2rem;
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  /* Desktop: 1024px+ */
  .container {
    padding: 3rem;
    max-width: 1200px;
  }
}
```

### 7.2 PWA Features
- **Offline Support**: Cache critical pages and data
- **Push Notifications**: New comments, prompt approvals
- **App-like Experience**: Full-screen mode, splash screen
- **Background Sync**: Queue actions when offline

## 8. Performance Optimization

### 8.1 Database Optimization
- **Indexes**: All foreign keys and search fields indexed
- **Query Optimization**: N+1 query prevention
- **Connection Pooling**: Prisma connection pooling
- **Read Replicas**: For analytics and reporting

### 8.2 Caching Strategy
```typescript
// Redis Caching Layers
const CACHE_KEYS = {
  USER_PROFILE: (id: string) => `user:${id}`,
  PROMPT_DETAILS: (id: string) => `prompt:${id}`,
  SEARCH_RESULTS: (query: string) => `search:${hash(query)}`,
  TRENDING_PROMPTS: 'trending:prompts',
  USER_CREDITS: (id: string) => `credits:${id}`,
};

const CACHE_TTL = {
  USER_PROFILE: 300,      // 5 minutes
  PROMPT_DETAILS: 600,    // 10 minutes
  SEARCH_RESULTS: 1800,   // 30 minutes
  TRENDING_PROMPTS: 3600, // 1 hour
  USER_CREDITS: 60,       // 1 minute
};
```

### 8.3 CDN & Asset Optimization
- **Image Optimization**: Next.js Image component with WebP
- **Code Splitting**: Route-based and component-based
- **Bundle Analysis**: Regular bundle size monitoring
- **Static Asset Caching**: Long-term caching for static assets

This comprehensive documentation covers all major user flows, technical implementations, and system architecture details for PromptCraft.
