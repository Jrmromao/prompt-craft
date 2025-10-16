# Email Alert System

## ✅ Implemented Features

### 1. Alert Settings Page (`/settings/alerts`)
- ✅ Fetches and saves alert preferences to database
- ✅ Four alert types:
  - Invalid API Key (default: enabled)
  - Cost Spike
  - Error Rate
  - Slow Response

### 2. Database Schema
- ✅ `AlertSettings` model added to Prisma schema
- ✅ Stores user preferences as JSON
- ✅ Migration applied successfully

### 3. Email Service (`lib/services/emailService.ts`)
- ✅ Uses Resend for email delivery
- ✅ Three email templates:
  - Invalid API Key Alert
  - Cost Spike Alert
  - Error Rate Alert

### 4. API Routes
- ✅ `GET /api/alerts` - Fetch user's alert settings
- ✅ `POST /api/alerts` - Save alert settings
- ✅ `POST /api/alerts/trigger` - Trigger alerts (for webhooks)

## 📧 Email Templates

### Invalid API Key Alert
**Subject:** ⚠️ PromptCraft: Invalid API Key Detected

**Content:**
- Explains the issue
- Lists what's affected (tracking, optimization)
- Confirms app still works
- Provides action steps
- Links to dashboard

### Cost Spike Alert
**Subject:** 💰 PromptCraft: Cost Spike Alert

**Content:**
- Shows current cost vs threshold
- Recommends actions
- Links to analytics
- Suggests optimizations

### Error Rate Alert
**Subject:** 🚨 PromptCraft: High Error Rate Alert

**Content:**
- Shows error rate vs threshold
- Lists possible causes
- Links to error details

## 🔧 Configuration

### Environment Variables Required
```bash
RESEND_API_KEY=re_xxxxx  # Get from resend.com
```

### Default Alert Settings
```json
{
  "invalidApiKey": { "enabled": true },
  "costSpike": { "enabled": false, "threshold": 50 },
  "errorRate": { "enabled": false, "threshold": 10 },
  "slowResponse": { "enabled": false, "threshold": 2000 }
}
```

## 🚀 How to Trigger Alerts

### From SDK (Invalid API Key)
When SDK detects 401/403, it can call:
```typescript
await fetch('https://promptcraft.app/api/alerts/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: hashedKey,
    type: 'invalid_api_key',
    data: { keyName: 'Production Key' }
  })
});
```

### From Backend (Cost Spike)
```typescript
await fetch('https://promptcraft.app/api/alerts/trigger', {
  method: 'POST',
  body: JSON.stringify({
    apiKey: hashedKey,
    type: 'cost_spike',
    data: { currentCost: 75.50 }
  })
});
```

### From Backend (Error Rate)
```typescript
await fetch('https://promptcraft.app/api/alerts/trigger', {
  method: 'POST',
  body: JSON.stringify({
    apiKey: hashedKey,
    type: 'error_rate',
    data: { errorRate: 15.5 }
  })
});
```

## 📊 Testing

### Test Alert Settings Save
1. Go to `/settings/alerts`
2. Toggle switches and set thresholds
3. Click "Save Alert Settings"
4. Refresh page - settings should persist

### Test Email Sending (Manual)
```typescript
import { EmailService } from '@/lib/services/emailService';

// Test invalid key alert
await EmailService.sendInvalidApiKeyAlert(
  'user@example.com',
  'Production Key'
);

// Test cost spike alert
await EmailService.sendCostSpikeAlert(
  'user@example.com',
  75.50,
  50
);

// Test error rate alert
await EmailService.sendErrorRateAlert(
  'user@example.com',
  15.5,
  10
);
```

## 🔐 Security

- Alert trigger endpoint requires valid API key hash
- Only sends emails if user has enabled that alert type
- Gracefully handles missing Resend API key
- Never exposes user email addresses in logs

## 📈 Next Steps

1. **Add to SDK**: Update SDK to call `/api/alerts/trigger` when detecting invalid keys
2. **Add Cron Jobs**: Check for cost spikes and error rates daily
3. **Add More Alerts**: 
   - Model deprecation warnings
   - Rate limit approaching
   - Unusual usage patterns
4. **Add SMS Alerts**: For critical issues
5. **Add Slack Integration**: Team notifications

## ✅ Verification Checklist

- [x] AlertSettings model in schema
- [x] Migration applied
- [x] Alert settings page loads
- [x] Settings save to database
- [x] Settings persist on refresh
- [x] Email service configured
- [x] Email templates created
- [x] Trigger endpoint secured
- [ ] Resend API key configured (needs env var)
- [ ] Test emails sent successfully
