# Plan Limits Enforcement

## ✅ Implemented Restrictions

### Free Plan ($0/month)
- **AI Spend Limit**: $100/month
- **Data Retention**: 7 days
- **Team Members**: 1
- **Features Disabled**:
  - ❌ Redis caching
  - ❌ Email alerts
  - ❌ Prompt optimization
  - ❌ Quality monitoring
  - ❌ Priority support

### Starter Plan ($19/month)
- **AI Spend Limit**: $500/month
- **Data Retention**: 30 days
- **Team Members**: 1
- **Features Enabled**:
  - ✅ Redis caching
  - ✅ Email alerts
  - ❌ Prompt optimization
  - ❌ Quality monitoring
  - ❌ Priority support

### Pro Plan ($49/month)
- **AI Spend Limit**: $2,000/month
- **Data Retention**: 90 days
- **Team Members**: 5
- **Features Enabled**:
  - ✅ Redis caching
  - ✅ Email alerts
  - ✅ Prompt optimization
  - ✅ Quality monitoring
  - ✅ Priority support

### Enterprise Plan ($199/month)
- **AI Spend Limit**: Unlimited
- **Data Retention**: 365 days
- **Team Members**: Unlimited
- **Features Enabled**:
  - ✅ All Pro features
  - ✅ SSO (SAML)
  - ✅ Custom integrations
  - ✅ SLA guarantee

## 🔒 Enforcement Mechanisms

### 1. AI Spend Tracking
```typescript
// Checked on every /api/integrations/run call
const spendCheck = await checkAISpendLimit(user.id);
if (!spendCheck.allowed) {
  return 402 Payment Required
}
```

**Behavior:**
- At 80% usage: Warning banner shown
- At 100% usage: Tracking paused, upgrade required
- User's app continues working (SDK graceful degradation)

### 2. Feature Gating
```typescript
const check = await checkPlanLimit(userId, 'caching');
if (!check.allowed) {
  // Feature disabled, show upgrade prompt
}
```

**Features Gated:**
- Caching (Starter+)
- Email alerts (Starter+)
- Prompt optimization (Pro+)
- Quality monitoring (Pro+)
- SSO (Enterprise)

### 3. Data Retention
```typescript
const canAccess = await checkDataRetention(userId, recordDate);
// Automatically filters old data based on plan
```

**Retention Periods:**
- Free: 7 days
- Starter: 30 days
- Pro: 90 days
- Enterprise: 365 days

### 4. Team Members
```typescript
const teamCheck = await checkTeamMemberLimit(userId);
if (!teamCheck.allowed) {
  // Block adding new team members
}
```

## 📊 User Experience

### Warning Flow (80% limit)
1. User hits 80% of monthly spend
2. Yellow banner appears: "You've used 80% of your limit"
3. "Upgrade" button shown
4. Tracking continues normally

### Limit Reached Flow (100% limit)
1. User hits 100% of monthly spend
2. Red banner appears: "Limit Reached - Tracking paused"
3. "Upgrade Now" button shown
4. API returns 402 Payment Required
5. SDK continues working (graceful degradation)
6. No tracking data saved until upgrade

### Feature Disabled Flow
1. User tries to use Pro feature on Free plan
2. Feature shows "Upgrade Required" state
3. Link to /pricing with feature highlighted
4. Clear explanation of what they're missing

## 🚀 API Endpoints

### Check Current Limits
```bash
GET /api/plan/limits
```

Response:
```json
{
  "plan": "FREE",
  "limits": {
    "maxAISpend": 100,
    "dataRetentionDays": 7,
    "teamMembers": 1,
    "features": { ... }
  },
  "usage": {
    "aiSpend": {
      "current": 75.50,
      "limit": 100,
      "percentUsed": 75.5,
      "allowed": true
    }
  }
}
```

### Track Run (with limit check)
```bash
POST /api/integrations/run
```

Response when limit exceeded:
```json
{
  "error": "LIMIT_EXCEEDED",
  "message": "You've reached your FREE plan limit of $100/month",
  "currentSpend": 100.00,
  "limit": 100,
  "upgradeUrl": "/pricing"
}
```

## 🎯 Upgrade Triggers

### Dashboard Banner
- Shows at 80% usage
- Dismissible but reappears on refresh
- Clear CTA to /pricing

### Feature Blocks
- Grayed out features with lock icon
- "Upgrade to unlock" tooltip
- Click opens pricing modal

### Email Notifications
- At 80%: "Approaching your limit"
- At 100%: "Limit reached - upgrade to continue"
- Weekly summary with upgrade CTA

## 🔧 Implementation Checklist

- [x] Plan limits defined in code
- [x] AI spend tracking with limits
- [x] Feature gating middleware
- [x] Data retention enforcement
- [x] Team member limits
- [x] API endpoint for limit checks
- [x] Upgrade banner component
- [ ] Add banner to dashboard layout
- [ ] Add feature gates to UI
- [ ] Add email notifications at 80%/100%
- [ ] Add data retention cleanup cron job
- [ ] Add team member limit to invite flow

## 📈 Next Steps

1. **Add UpgradeBanner to dashboard layout**
2. **Gate caching in SDK** - Check plan before using cache
3. **Gate email alerts** - Check plan before sending
4. **Add data cleanup cron** - Delete old data based on retention
5. **Add team invite limits** - Block invites when limit reached
