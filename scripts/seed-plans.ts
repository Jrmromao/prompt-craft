// @ts-nocheck
const { PrismaClient, Period } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed plans for the application
 * This script creates three plans:
 * - PRO: Professional plan with 1000 credits per month
 * - ELITE: Advanced plan with 5000 credits per month
 * - ENTERPRISE: Custom plan with unlimited credits and dedicated support
 */
async function seedPlans() {
  try {
    console.log('🌱 Starting to seed plans...');

    const plans = [
      {
        name: 'PRO',
        description: 'For professionals and growing teams. Get 1000 credits monthly, priority support, and advanced features.',
        price: 49.99,
        credits: 1000,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_pro_monthly_plan',
      },
      {
        name: 'ELITE',
        description: 'For established businesses. Get 5000 credits monthly, dedicated support, and all premium features including API access.',
        price: 199.99,
        credits: 5000,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_elite_monthly_plan',
      },
      {
        name: 'ENTERPRISE',
        description: 'For large organizations. Custom credit limits, dedicated account manager, custom integrations, and enterprise-grade support.',
        price: 499.99,
        credits: 20000,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_enterprise_monthly_plan',
      },
    ];

    // Use Promise.all to seed all plans concurrently
    const results = await Promise.all(
      plans.map(async (plan) => {
        try {
          const result = await prisma.plan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan,
          });
          console.log(`✅ Successfully seeded plan: ${plan.name}`);
          return result;
        } catch (error) {
          console.error(`❌ Error seeding plan ${plan.name}:`, error);
          throw error;
        }
      })
    );

    console.log('✨ All plans have been successfully seeded!');
    return results;
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    throw error;
  }
}

// Execute the seeding
seedPlans()
  .catch((error) => {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('👋 Database connection closed');
  });
