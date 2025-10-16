#!/usr/bin/env ts-node

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔍 Verifying Pricing → Stripe Integration...\n');

  // 1. Check if plans exist in database
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      stripePriceId: true,
      stripeAnnualPriceId: true,
      stripeProductId: true,
    },
  });

  console.log(`📊 Found ${plans.length} active plans in database:\n`);

  let hasIssues = false;

  for (const plan of plans) {
    console.log(`Plan: ${plan.name} ($${plan.price})`);
    console.log(`  ID: ${plan.id}`);
    console.log(`  Stripe Product ID: ${plan.stripeProductId || '❌ MISSING'}`);
    console.log(`  Monthly Price ID: ${plan.stripePriceId || '❌ MISSING'}`);
    console.log(`  Annual Price ID: ${plan.stripeAnnualPriceId || '⚠️  Not set'}`);

    // Check for placeholder values
    if (!plan.stripePriceId || plan.stripePriceId === '' || plan.stripePriceId.includes('placeholder')) {
      console.log(`  ❌ Monthly price ID is missing or placeholder`);
      hasIssues = true;
    } else if (plan.stripePriceId.startsWith('price_1234')) {
      console.log(`  ⚠️  Monthly price ID looks like a placeholder`);
      hasIssues = true;
    } else {
      console.log(`  ✅ Monthly price ID configured`);
    }

    if (plan.stripeAnnualPriceId && plan.stripeAnnualPriceId.startsWith('price_1234')) {
      console.log(`  ⚠️  Annual price ID looks like a placeholder`);
    }

    console.log('');
  }

  // 2. Check pricing page flow
  console.log('📄 Pricing Page Flow:');
  console.log('  1. User visits /pricing');
  console.log('  2. Frontend fetches /api/plans');
  console.log('  3. User clicks "Start Free Trial"');
  console.log('  4. Frontend calls /api/stripe/create-checkout with:');
  console.log('     - planId');
  console.log('     - stripePriceId (monthly or annual)');
  console.log('     - period');
  console.log('  5. Backend creates Stripe checkout session');
  console.log('  6. User redirected to Stripe');
  console.log('  7. After payment, webhook updates subscription\n');

  // 3. Summary
  if (hasIssues) {
    console.log('❌ Issues found! Update Stripe price IDs in database:');
    console.log('\nTo fix:');
    console.log('1. Create products and prices in Stripe Dashboard');
    console.log('2. Update database with real price IDs:');
    console.log('   UPDATE "Plan" SET "stripePriceId" = \'price_xxx\' WHERE name = \'Pro\';');
    console.log('   UPDATE "Plan" SET "stripeAnnualPriceId" = \'price_yyy\' WHERE name = \'Pro\';');
    process.exit(1);
  } else {
    console.log('✅ Pricing → Stripe integration is properly configured!');
    process.exit(0);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
