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

# 2. Check database
echo "\n2️⃣ Checking database..."
npx prisma db pull > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Database connection failed"
  exit 1
fi
echo "✅ Database connected"

# 3. Check Subscription model
echo "\n3️⃣ Checking Subscription model..."
if ! grep -q "model Subscription" prisma/schema.prisma; then
  echo "❌ Subscription model not found"
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
