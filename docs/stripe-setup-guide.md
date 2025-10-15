# Stripe Setup Guide - PromptCraft Pricing

## Overview

We have 3 pricing tiers:
- **Free:** $0/month (1,000 requests)
- **Pro:** $9/month (unlimited requests)
- **Enterprise:** $99/month (team features)

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" or "Sign in"
3. Create account or log in
4. Complete business verification (if required)

---

## Step 2: Create Products in Stripe Dashboard

### 2.1 Navigate to Products

1. Go to https://dashboard.stripe.com/products
2. Click "+ Add product"

### 2.2 Create Pro Plan ($9/month)

**Product Information:**
- Name: `PromptCraft Pro`
- Description: `Unlimited requests, prompt optimization, smart caching, priority support`

**Pricing:**
- Pricing model: `Standard pricing`
- Price: `$9.00 USD`
- Billing period: `Monthly`
- Currency: `USD`

**Advanced Options:**
- Usage type: `Licensed` (not metered)
- Tax behavior: `Taxable` (if applicable)

Click **"Save product"**

**Copy the Price ID:**
- After saving, you'll see a price ID like: `price_1ABC123xyz...`
- Copy this - you'll need it for `.env`

### 2.3 Create Enterprise Plan ($99/month)

Repeat the same process:

**Product Information:**
- Name: `PromptCraft Enterprise`
- Description: `Everything in Pro + team collaboration, custom limits, dedicated support, SLA`

**Pricing:**
- Price: `$99.00 USD`
- Billing period: `Monthly`

Click **"Save product"**

**Copy the Price ID** for Enterprise

---

## Step 3: Get API Keys

### 3.1 Get Publishable Key

1. Go to https://dashboard.stripe.com/apikeys
2. Find "Publishable key" (starts with `pk_test_` or `pk_live_`)
3. Click "Reveal test key" or "Reveal live key"
4. Copy the key

### 3.2 Get Secret Key

1. On the same page, find "Secret key" (starts with `sk_test_` or `sk_live_`)
2. Click "Reveal test key" or "Reveal live key"
3. Copy the key
4. **⚠️ NEVER commit this to git!**

### 3.3 Get Webhook Secret (for later)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

---

## Step 4: Update Environment Variables

Add to your `.env.local`:

```bash
# Stripe Keys
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Price IDs
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID

# Stripe URLs
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Example:**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123xyz...
STRIPE_SECRET_KEY=sk_test_51ABC123xyz...
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
STRIPE_PRO_PRICE_ID=price_1ABC123xyz...
STRIPE_ENTERPRISE_PRICE_ID=price_1DEF456xyz...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123xyz...
```

---

## Step 5: Test the Integration

### 5.1 Test Mode

Stripe starts in **Test Mode** by default. Use test cards:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Failed Payment:**
- Card: `4000 0000 0000 0002`

### 5.2 Test Checkout Flow

1. Go to your pricing page: `http://localhost:3000/pricing`
2. Click "Start Free Trial" on Pro plan
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Should redirect back to your app
7. Check dashboard - plan should be upgraded to Pro

### 5.3 Test Webhook

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Complete a test checkout
4. Check terminal - should see webhook events
5. Check database - subscription should be created

---

## Step 6: Go Live

### 6.1 Switch to Live Mode

1. Go to https://dashboard.stripe.com
2. Toggle "Test mode" to "Live mode" (top right)
3. Complete business verification if required
4. Activate your account

### 6.2 Create Live Products

Repeat Step 2 in **Live Mode**:
- Create Pro plan ($9/month)
- Create Enterprise plan ($99/month)
- Copy the **live** price IDs

### 6.3 Get Live API Keys

Repeat Step 3 in **Live Mode**:
- Get live publishable key (`pk_live_...`)
- Get live secret key (`sk_live_...`)
- Create live webhook endpoint
- Get live webhook secret (`whsec_...`)

### 6.4 Update Production Environment Variables

In your production environment (Vercel, Railway, etc.):

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
STRIPE_PRO_PRICE_ID=price_YOUR_LIVE_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_LIVE_ENTERPRISE_PRICE_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
```

---

## Step 7: Monitor Subscriptions

### 7.1 View Customers

1. Go to https://dashboard.stripe.com/customers
2. See all customers and their subscriptions

### 7.2 View Payments

1. Go to https://dashboard.stripe.com/payments
2. See all successful/failed payments

### 7.3 View Subscriptions

1. Go to https://dashboard.stripe.com/subscriptions
2. See all active/canceled subscriptions

---

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct: `https://yourdomain.com/api/webhooks/stripe`
2. Check webhook secret is correct in `.env`
3. Check webhook events are selected
4. Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Checkout Not Redirecting

1. Check `success_url` and `cancel_url` in checkout session
2. Should be: `https://yourdomain.com/dashboard?success=true`
3. Check Stripe logs: https://dashboard.stripe.com/logs

### Subscription Not Created

1. Check webhook is receiving events
2. Check database connection
3. Check Prisma schema has Subscription model
4. Check webhook handler code

---

## Quick Reference

### Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

### Webhook Events

- `checkout.session.completed` - User completed checkout
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### Useful Links

- Dashboard: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Products: https://dashboard.stripe.com/products
- Webhooks: https://dashboard.stripe.com/webhooks
- Customers: https://dashboard.stripe.com/customers
- Docs: https://stripe.com/docs

---

## Summary

1. ✅ Create Stripe account
2. ✅ Create Pro ($9) and Enterprise ($99) products
3. ✅ Copy price IDs
4. ✅ Get API keys (publishable, secret, webhook)
5. ✅ Add to `.env.local`
6. ✅ Test with test cards
7. ✅ Go live when ready

**You're done!** Users can now subscribe to Pro ($9/month) or Enterprise ($99/month).
