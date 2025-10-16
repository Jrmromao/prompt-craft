# 💰 PAYMENT VERIFICATION CHECKLIST
## Don't Launch Until ALL Items Are ✅

### 🔴 CRITICAL - Test These First

#### 1. Stripe Test Mode End-to-End
- [ ] Create Stripe test account products
- [ ] Add test price IDs to `.env.local`
- [ ] Click "Upgrade Now" on pricing page
- [ ] Complete checkout with test card `4242 4242 4242 4242`
- [ ] Verify redirect to success page
- [ ] **CHECK DATABASE**: Subscription row created with status='ACTIVE'
- [ ] **CHECK STRIPE DASHBOARD**: Payment shows as succeeded
- [ ] **CHECK USER ACCESS**: Can access paid features

**If ANY of these fail, DO NOT LAUNCH**

#### 2. Webhook Verification
- [ ] Setup Stripe webhook endpoint: `https://prompthive.co/api/stripe/webhook`
- [ ] Add webhook secret to `.env`
- [ ] Make test payment
- [ ] **CHECK STRIPE DASHBOARD**: Webhook shows ✅ succeeded (not ❌ failed)
- [ ] **CHECK LOGS**: See "✅ Subscription created for user..." message
- [ ] **CHECK DATABASE**: Subscription has correct stripeSubscriptionId

**If webhooks fail, payments succeed but users get nothing = LOST MONEY**

#### 3. Plan Access Enforcement
- [ ] User on FREE plan tries to access Pro feature
- [ ] Should see upgrade prompt, NOT access feature
- [ ] User upgrades to Pro
- [ ] **IMMEDIATELY** can access Pro features
- [ ] User cancels subscription
- [ ] **IMMEDIATELY** loses Pro access, back to FREE

**If access isn't enforced, you're giving away paid features for free**

### 🟡 IMPORTANT - Revenue Protection

#### 4. Failed Payment Handling
- [ ] Use test card `4000 0000 0000 0341` (payment fails)
- [ ] **CHECK DATABASE**: Subscription status='PAST_DUE'
- [ ] **CHECK USER ACCESS**: Loses paid features
- [ ] **CHECK EMAIL**: User gets payment failed notification

**If failed payments don't revoke access, users get free service**

#### 5. Subscription Cancellation
- [ ] User cancels in Stripe dashboard
- [ ] Webhook fires: `customer.subscription.deleted`
- [ ] **CHECK DATABASE**: plan='FREE', status='CANCELED'
- [ ] **CHECK USER ACCESS**: Immediately loses paid features
- [ ] User can still login and use free tier

**If cancellations don't work, you keep charging but provide no value = refunds + churn**

#### 6. Duplicate Payment Prevention
- [ ] User clicks "Upgrade Now" twice quickly
- [ ] Should only create ONE subscription
- [ ] **CHECK STRIPE**: Only one subscription exists
- [ ] **CHECK DATABASE**: Only one subscription row

**If duplicates happen, users get charged twice = refunds + angry customers**

### 🟢 NICE TO HAVE - But Still Important

#### 7. Upgrade Path
- [ ] User on Starter upgrades to Pro
- [ ] Stripe handles proration correctly
- [ ] **CHECK DATABASE**: plan updated to 'PRO'
- [ ] **CHECK STRIPE**: Subscription updated, not duplicated

#### 8. Downgrade Path
- [ ] User on Pro downgrades to Starter
- [ ] **CHECK DATABASE**: plan='STARTER'
- [ ] **CHECK ACCESS**: Can't access Pro-only features

#### 9. Email Notifications
- [ ] Payment succeeded → User gets confirmation email
- [ ] Payment failed → User gets retry email
- [ ] Subscription canceled → User gets confirmation

### 📊 Monitoring Setup

#### 10. Revenue Tracking
- [ ] Can see MRR in Stripe dashboard
- [ ] Can query active subscriptions in database
- [ ] Numbers match between Stripe and database

```sql
-- Run this query daily
SELECT 
  plan,
  COUNT(*) as active_subs,
  CASE 
    WHEN plan = 'STARTER' THEN COUNT(*) * 19
    WHEN plan = 'PRO' THEN COUNT(*) * 49
    ELSE 0
  END as monthly_revenue
FROM Subscription
WHERE status = 'ACTIVE'
GROUP BY plan;
```

#### 11. Webhook Monitoring
- [ ] Setup Stripe webhook monitoring alerts
- [ ] Get notified if webhook fails
- [ ] Check webhook logs daily for first week

#### 12. Failed Payment Alerts
- [ ] Get notified when payment fails
- [ ] Can manually reach out to customer
- [ ] Have retry payment flow

### 🚨 RED FLAGS - Stop Everything If You See These

1. **Webhook shows failed in Stripe dashboard**
   - Payments succeed but database not updated
   - Users pay but get nothing
   - FIX IMMEDIATELY

2. **Subscription in Stripe but not in database**
   - You're charging but not tracking
   - Can't enforce limits
   - RECONCILE IMMEDIATELY

3. **User has paid plan but can't access features**
   - They'll request refund
   - Bad reviews
   - FIX BEFORE THEY NOTICE

4. **User on FREE plan can access paid features**
   - You're losing money
   - No incentive to upgrade
   - FIX IMMEDIATELY

### 🧪 Test Script - Run This Before Launch

```bash
#!/bin/bash

echo "🧪 PAYMENT VERIFICATION TEST"
echo "============================"

# 1. Check environment variables
echo "\n1️⃣ Checking environment variables..."
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ STRIPE_SECRET_KEY missing"
  exit 1
fi
if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "❌ STRIPE_WEBHOOK_SECRET missing"
  exit 1
fi
if [ -z "$NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID" ]; then
  echo "❌ NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID missing"
  exit 1
fi
echo "✅ All environment variables set"

# 2. Check webhook endpoint
echo "\n2️⃣ Checking webhook endpoint..."
WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://prompthive.co/api/stripe/webhook -X POST)
if [ "$WEBHOOK_STATUS" != "400" ] && [ "$WEBHOOK_STATUS" != "500" ]; then
  echo "❌ Webhook endpoint not responding correctly (got $WEBHOOK_STATUS)"
  exit 1
fi
echo "✅ Webhook endpoint accessible"

# 3. Check database connection
echo "\n3️⃣ Checking database..."
npx prisma db pull > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Database connection failed"
  exit 1
fi
echo "✅ Database connected"

# 4. Check Subscription model exists
echo "\n4️⃣ Checking Subscription model..."
if ! grep -q "model Subscription" prisma/schema.prisma; then
  echo "❌ Subscription model not found in schema"
  exit 1
fi
echo "✅ Subscription model exists"

echo "\n✅ ALL AUTOMATED CHECKS PASSED"
echo "\n⚠️  NOW DO MANUAL TESTS:"
echo "1. Make test payment with card 4242 4242 4242 4242"
echo "2. Check Stripe dashboard for webhook success"
echo "3. Check database for subscription row"
echo "4. Verify user can access paid features"
echo "\n🚀 Only launch after ALL manual tests pass!"
```

Save as `verify-payments.sh` and run before launch!

### 📝 Launch Day Checklist

**Morning of Launch:**
- [ ] Switch to Stripe LIVE keys (not test)
- [ ] Update webhook URL to production
- [ ] Test ONE real payment with your own card ($19)
- [ ] Verify it works end-to-end
- [ ] Refund yourself
- [ ] NOW you can launch

**First 24 Hours:**
- [ ] Check Stripe dashboard every 2 hours
- [ ] Check webhook success rate
- [ ] Check database subscriptions match Stripe
- [ ] Respond to any payment issues IMMEDIATELY

**First Week:**
- [ ] Daily revenue reconciliation
- [ ] Daily webhook health check
- [ ] Monitor failed payments
- [ ] Check for duplicate subscriptions

### 🆘 Emergency Contacts

**If payments break:**
1. Check Stripe dashboard → Webhooks → See errors
2. Check application logs for webhook failures
3. Check database for missing subscriptions
4. Manually create subscription if needed:

```sql
-- Emergency: Manually create subscription
INSERT INTO Subscription (id, userId, plan, status, stripeSubscriptionId, currentPeriodEnd)
VALUES ('sub_emergency_123', 'user_id', 'STARTER', 'ACTIVE', 'sub_from_stripe', NOW() + INTERVAL '30 days');
```

### 💡 Pro Tips

1. **Test with real card first** - Use your own card, make real payment, verify everything, then refund
2. **Monitor webhooks obsessively** - First week, check every few hours
3. **Have Stripe dashboard open** - During launch, keep it open in another tab
4. **Set up Slack/email alerts** - Get notified of failed webhooks immediately
5. **Reconcile daily** - Compare Stripe subscriptions with database every day for first month

### ⚠️ Common Ways to Lose Money

1. ❌ Webhook fails silently → Users pay but get nothing → Refunds
2. ❌ Access not enforced → Users get paid features for free
3. ❌ Cancellations don't work → Keep charging but provide no value → Chargebacks
4. ❌ Failed payments don't revoke access → Users get free service
5. ❌ Duplicate subscriptions → Users charged twice → Refunds + bad reviews

### ✅ You're Safe When...

- Webhook success rate = 100%
- Every Stripe subscription has database row
- Every database subscription has Stripe subscription
- Paid features are actually locked for free users
- Cancellations immediately revoke access
- Failed payments immediately revoke access

---

## 🎯 FINAL CHECK BEFORE LAUNCH

Run this command and ALL must be ✅:

```bash
./verify-payments.sh && \
echo "\n✅ Automated checks passed" && \
echo "\n⚠️  NOW DO THESE MANUALLY:" && \
echo "1. Make test payment" && \
echo "2. Check webhook succeeded" && \
echo "3. Check database updated" && \
echo "4. Verify feature access" && \
echo "\n🚀 Launch only after ALL pass!"
```

**If even ONE thing fails, DO NOT LAUNCH until fixed.**

Your money is too important to risk. Test everything twice.
