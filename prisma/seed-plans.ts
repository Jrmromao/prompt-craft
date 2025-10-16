import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding plans...');

  // Free Trial Plan
  await prisma.plan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: {
      id: 'plan_free',
      name: 'FREE',
      description: '14-day trial with all Pro features',
      price: 0,
      period: 'trial',
      currency: 'USD',
      isActive: true,
      isEnterprise: false,
      stripeProductId: '',
      stripePriceId: '',
      stripeAnnualPriceId: null,
      features: [
        'AI Prompt Optimization',
        'Smart Routing',
        'Cost Tracking',
        'Auto-Fallback',
        '14-Day Trial',
      ],
      updatedAt: new Date(),
    },
  });

  // Pro Plan
  await prisma.plan.upsert({
    where: { name: 'PRO' },
    update: {},
    create: {
      id: 'plan_pro',
      name: 'PRO',
      description: 'Save $30+/month on AI costs',
      price: 9,
      period: 'month',
      currency: 'USD',
      isActive: true,
      isEnterprise: false,
      stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID || 'prod_placeholder',
      stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_placeholder_monthly',
      stripeAnnualPriceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_placeholder_annual',
      features: [
        'AI Prompt Optimization',
        'Smart Routing',
        'Real Savings Tracking',
        'Auto-Fallback',
        'Cost Limits',
        'Email Alerts',
        'Unlimited API Keys',
        'Advanced Analytics',
        'Priority Support',
      ],
      updatedAt: new Date(),
    },
  });

  console.log('✅ Plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
