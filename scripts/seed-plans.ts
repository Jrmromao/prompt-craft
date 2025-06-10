// @ts-nocheck
const { PrismaClient, Period } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed plans for the application
 * This script creates three plans:
 * - FREE: Basic plan with 10 credits per month
 * - LITE: Weekly plan with 250 credits
 * - PRO: Premium plan with 1500 credits per month
 */
async function seedPlans() {
  try {
    console.log('🌱 Starting to seed plans...');

    const plans = [
      {
        name: 'FREE',
        description: 'Perfect for trying out PromptCraft. Includes basic features and 10 credits per month.',
        price: 0,
        credits: 10,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_free_plan',
      },
      {
        name: 'LITE',
        description: 'For regular users who need more power. Get 250 credits weekly and access to advanced features.',
        price: 9.99,
        credits: 250,
        period: Period.WEEKLY,
        isActive: true,
        stripeProductId: 'prod_lite_weekly_plan',
      },
      {
        name: 'PRO',
        description: 'For power users and professionals. Get 1500 credits monthly, priority support, and all premium features.',
        price: 29.99,
        credits: 1500,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_pro_monthly_plan',
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
