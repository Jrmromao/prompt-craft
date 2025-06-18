// @ts-nocheck
const { PrismaClient, Period } = require('@prisma/client');

const prismaScript = new PrismaClient();

/**
 * Seed plans for the application
 * This script creates three plans:
 * - PRO: Professional plan with basic features
 * - ELITE: Advanced plan with premium features
 * - ENTERPRISE: Custom plan with enterprise features
 */
async function seedPlans() {
  try {
    console.log('🌱 Starting to seed plans...');

    const plans = [
      {
        name: 'PRO',
        description: 'For professionals and growing teams. Get priority support and advanced features.',
        price: 49.99,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_STsnbGxz9EgRHW',
        stripePriceId: 'price_1RYv1gPcCjSUfFvQWi6WW5UO', // Monthly price
        stripeAnnualPriceId: 'price_1RYv1gPcCjSUfFvQWi6WW5UO', // Annual price
        features: [
          'Basic prompt types',
          'Save prompts',
          'Prompt history',
          'Priority support',
          'Monthly credit reset'
        ],
        isEnterprise: false,
        currency: 'USD'
      },
      {
        name: 'ELITE',
        description: 'For established businesses. Get dedicated support and all premium features including API access.',
        price: 199.99,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_STsoyX8h6IpQH5',
        stripePriceId: 'price_1RYv31PcCjSUfFvQtROPqaDC', // Monthly price
        stripeAnnualPriceId: 'price_1RYv31PcCjSUfFvQtROPqaDC', // Annual price
        features: [
          'Unlimited Testing Runs',
          'Unlimited Private Prompts',
          'Advanced Analytics',
          'Bring Your Own API Key',
          'Priority Support',
          'Custom Integrations'
        ],
        isEnterprise: false,
        currency: 'USD'
      },
      {
        name: 'ENTERPRISE',
        description: 'For large organizations. Custom solutions, dedicated account manager, and enterprise-grade support.',
        price: 499.99,
        period: Period.MONTHLY,
        isActive: true,
        stripeProductId: 'prod_STsp8bVRuv93pU',
        stripePriceId: 'price_1RYv4KPcCjSUfFvQKaj1oRRs', // Monthly price
        stripeAnnualPriceId: 'price_1RYv4KPcCjSUfFvQKaj1oRRs', // Annual price
        features: [
          'Everything in Elite',
          'Custom AI Model Fine-tuning',
          'Dedicated Account Manager',
          'SLA Guarantee',
          'Custom API Integration',
          'Team Management',
          'Advanced Security'
        ],
        isEnterprise: true,
        currency: 'USD'
      }
    ];

    // Use Promise.all to seed all plans concurrently
    const results = await Promise.all(
      plans.map(async (plan) => {
        try {
          const result = await prismaScript.plan.upsert({
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
    await prismaScript.$disconnect();
    console.log('👋 Database connection closed');
  });
