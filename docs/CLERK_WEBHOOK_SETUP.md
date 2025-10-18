# Clerk Webhook Setup

## Why This Is Critical

**Without Clerk webhook, users can sign up but won't exist in your database!**

This means:
- ❌ They can't upgrade (no user record)
- ❌ They can't use API keys (no user record)
- ❌ They can't be tracked (no user record)
- ❌ You lose customers

## Setup Steps

### 1. Go to Clerk Dashboard

https://dashboard.clerk.com → Your App → Webhooks

### 2. Create Endpoint

Click "Add Endpoint"

**Endpoint URL:**
```
https://prompthive.co/api/webhooks/clerk
```

**For local testing:**
```
Use Clerk CLI or ngrok to forward to localhost:3001/api/webhooks/clerk
```

### 3. Subscribe to Events

Select these events:
- ✅ `user.created` (CRITICAL - creates user in database)
- ✅ `user.updated` (updates user info)
- ✅ `user.deleted` (GDPR compliance)

### 4. Get Webhook Secret

After creating endpoint, Clerk shows a signing secret like:
```
whsec_abc123...
```

Copy this!

### 5. Add to Environment

Add to `.env.local`:
```bash
CLERK_WEBHOOK_SECRET="whsec_abc123..."
```

### 6. Test It

**Sign up a new user:**
1. Go to your app
2. Click "Sign Up"
3. Create account
4. Check Clerk dashboard → Webhooks → See event succeeded ✅
5. Check your database:

```sql
SELECT * FROM User WHERE clerkId = 'user_xxx';
```

Should see the new user!

**If webhook failed (❌):**
- User signed up in Clerk
- But NOT in your database
- They can't do anything
- FIX IMMEDIATELY

## Common Issues

### Issue: "Missing svix headers"
- Clerk not sending webhook
- Check endpoint URL is correct
- Check events are selected

### Issue: "Invalid signature"
- Wrong webhook secret
- Check CLERK_WEBHOOK_SECRET matches Clerk dashboard
- Make sure no extra spaces

### Issue: "Error creating user"
- Check database connection
- Check User model in Prisma schema
- Check logs for actual error

### Issue: User can sign up but can't upgrade
- Webhook probably failed
- User exists in Clerk but not database
- Manually create user:

```sql
INSERT INTO User (id, clerkId, email, name)
VALUES ('user_emergency_123', 'clerk_user_id', 'email@example.com', 'Name');
```

## Verification Checklist

Before launch:
- [ ] Webhook endpoint created in Clerk
- [ ] Webhook secret added to .env
- [ ] Test signup creates user in database
- [ ] Check Clerk dashboard shows webhook succeeded
- [ ] User can immediately upgrade after signup

## Monitoring

**Daily checks (first week):**
- Clerk dashboard → Webhooks → Check success rate
- Should be 100% ✅
- If any ❌ failed, investigate immediately

**Check database matches Clerk:**
```sql
-- Count users in database
SELECT COUNT(*) FROM User;

-- Compare with Clerk dashboard user count
-- Should match!
```

## Emergency: Webhook Down

If webhook goes down:
1. Users can still sign up (in Clerk)
2. But won't be in database
3. They'll get errors trying to use app
4. Fix webhook ASAP
5. Manually sync users:

```typescript
// Emergency sync script
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

async function syncUsers() {
  const clerkUsers = await clerkClient.users.getUserList();
  
  for (const clerkUser of clerkUsers) {
    const exists = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    });
    
    if (!exists) {
      await prisma.user.create({
        data: {
          id: `user_${Date.now()}`,
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        }
      });
      console.log(`Synced user: ${clerkUser.id}`);
    }
  }
}
```

## Testing Script

```bash
#!/bin/bash

echo "🧪 Testing Clerk Webhook..."

# 1. Check webhook secret
if [ -z "$CLERK_WEBHOOK_SECRET" ]; then
  echo "❌ CLERK_WEBHOOK_SECRET not set"
  exit 1
fi
echo "✅ Webhook secret set"

# 2. Check endpoint accessible
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://prompthive.co/api/webhooks/clerk -X POST)
if [ "$STATUS" != "400" ]; then
  echo "❌ Webhook endpoint not responding (got $STATUS)"
  exit 1
fi
echo "✅ Webhook endpoint accessible"

echo "\n⚠️  NOW TEST MANUALLY:"
echo "1. Sign up new user"
echo "2. Check Clerk dashboard for webhook success"
echo "3. Check database for user record"
```

## Production Checklist

- [ ] Webhook endpoint uses production URL
- [ ] Webhook secret is production secret (not test)
- [ ] Events are selected (user.created, user.updated, user.deleted)
- [ ] Test signup works end-to-end
- [ ] Monitor webhook success rate daily

---

**CRITICAL: Test this before launch!**

Without working Clerk webhook, users can sign up but can't use your app = bad first impression = churn.
