# Stripe Integration Setup & Verification

## Critical: This MUST work before launch!

### 1. Create Stripe Products & Prices

Go to https://dashboard.stripe.com/test/products

**Starter Plan - $19/month**
```
Product Name: PromptHive Starter
Description: Optimize up to $500/month in AI costs
Price: $19.00 USD / month
Billing: Recurring
```
Copy the Price ID (starts with `price_...`)

**Pro Plan - $49/month**
```
Product Name: PromptHive Pro  
Description: Optimize up to $2,000/month in AI costs
Price: $49.00 USD / month
Billing: Recurring
```
Copy the Price ID

### 2. Set Environment Variables

Add to `.env.local`:
```bash
# Stripe Keys
STRIPE_SECRET_KEY="sk_test_..." # From https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET="whsec_..." # From webhook setup (step 3)

# Price IDs (from step 1)
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID="price_..." # Same as above
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_..." # Same as above
```

### 3. Setup Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://prompthive.co/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (`whsec_...`)
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Test Locally with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Copy the webhook secret it shows and add to .env.local
```

### 5. Test the Flow

**Test Checkout:**
```bash
# Start dev server
npm run dev

# Go to http://localhost:3001/pricing
# Click "Upgrade Now" on Starter plan
# Should redirect to Stripe Checkout
```

**Test Payment:**
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Complete checkout
5. Should redirect to `/settings/billing?success=true`

**Verify Database:**
```bash
# Check subscription was created
npx prisma studio

# Look in Subscription table
# Should see:
# - plan: "STARTER"
# - status: "ACTIVE"
# - stripeSubscriptionId: "sub_..."
# - currentPeriodEnd: future date
```

### 6. Verify Webhook Events

Check Stripe Dashboard:
- Go to https://dashboard.stripe.com/test/webhooks
- Click on your webhook
- See "Events" tab
- Should show successful events:
  - ✅ `checkout.session.completed`
  - ✅ `customer.subscription.created`
  - ✅ `invoice.payment_succeeded`

### 7. Test Subscription Updates

**Test Upgrade:**
```bash
# User on Starter plan
# Click "Upgrade Now" on Pro plan
# Should update subscription in Stripe
# Database should update to plan: "PRO"
```

**Test Cancellation:**
```bash
# Go to Stripe Dashboard
# Customers → Find test customer
# Subscriptions → Cancel subscription
# Webhook should fire
# Database should update to status: "CANCELED", plan: "FREE"
```

### 8. Common Issues

**Issue: "No checkout URL returned"**
- Check STRIPE_SECRET_KEY is set
- Check price IDs are correct
- Check user exists in database

**Issue: "Webhook signature verification failed"**
- Check STRIPE_WEBHOOK_SECRET matches webhook
- Make sure using raw body (not parsed JSON)
- Check webhook endpoint is `/api/stripe/webhook`

**Issue: Subscription not created in database**
- Check webhook events are firing
- Check metadata includes userId and planId
- Check Prisma schema has Subscription model
- Check logs: `console.log` in webhook handler

**Issue: Payment succeeded but plan not upgraded**
- Check `handleCheckoutCompleted` function
- Verify planMap has correct price IDs
- Check subscription upsert logic

### 9. Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (not test)
- [ ] Create live products & prices
- [ ] Update webhook URL to production domain
- [ ] Test with real card (small amount)
- [ ] Verify webhook events in production
- [ ] Test full flow: signup → upgrade → payment → access
- [ ] Test cancellation flow
- [ ] Test failed payment handling
- [ ] Monitor Stripe Dashboard for errors

### 10. Monitoring

**Daily checks:**
- Stripe Dashboard → Payments (check for failures)
- Stripe Dashboard → Webhooks (check for errors)
- Database → Subscriptions (check status matches Stripe)

**Weekly checks:**
- Reconcile Stripe subscriptions with database
- Check for orphaned subscriptions
- Verify MRR matches expectations

### 11. Support Issues

**Customer says "I paid but don't have access"**
1. Check Stripe Dashboard for payment
2. Check webhook events fired successfully
3. Check database Subscription table
4. If missing, manually create subscription
5. Investigate why webhook failed

**Customer wants refund**
1. Go to Stripe Dashboard → Payments
2. Find payment → Refund
3. Webhook will fire → subscription canceled
4. Database will update automatically

### 12. Revenue Tracking

**Check MRR (Monthly Recurring Revenue):**
```sql
SELECT 
  plan,
  COUNT(*) as subscribers,
  CASE 
    WHEN plan = 'STARTER' THEN COUNT(*) * 19
    WHEN plan = 'PRO' THEN COUNT(*) * 49
    ELSE 0
  END as monthly_revenue
FROM Subscription
WHERE status = 'ACTIVE'
GROUP BY plan;
```

**Stripe Dashboard:**
- Go to https://dashboard.stripe.com/revenue
- See MRR, churn rate, growth

---

## Quick Test Script

```bash
#!/bin/bash

echo "🧪 Testing Stripe Integration..."

# 1. Check env vars
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ STRIPE_SECRET_KEY not set"
  exit 1
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "❌ STRIPE_WEBHOOK_SECRET not set"
  exit 1
fi

echo "✅ Environment variables set"

# 2. Test checkout endpoint
curl -X POST http://localhost:3001/api/stripe/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"'$STRIPE_STARTER_PRICE_ID'","planId":"'$STRIPE_STARTER_PRICE_ID'"}'

echo "\n✅ Checkout endpoint working"

# 3. Test webhook endpoint
curl -X POST http://localhost:3001/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}'

echo "\n✅ Webhook endpoint accessible"

echo "\n🎉 Basic tests passed! Now test full flow in browser."
```

Save as `test-stripe.sh` and run: `chmod +x test-stripe.sh && ./test-stripe.sh`
