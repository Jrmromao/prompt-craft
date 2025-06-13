import { PrismaClient, PlanType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function seedPlanLimits() {
  console.log('🌱 Seeding plan limits...');

  try {
    // Delete all existing plan limits
    console.log('🗑️  Deleting existing plan limits...');
    await prisma.planLimits.deleteMany({});
    console.log('✅ Existing plan limits deleted');

    // Define plan limits for each plan type
    const planLimits = [
      // Free Plan
      {
        planType: PlanType.FREE,
        feature: 'private_prompts',
        limit: 3,
        period: 'monthly',
        description: 'Create up to 3 private prompts per month'
      },
      {
        planType: PlanType.FREE,
        feature: 'prompt_runs',
        limit: 100,
        period: 'monthly',
        description: 'Run up to 100 prompts per month'
      },
      {
        planType: PlanType.FREE,
        feature: 'version_control',
        limit: 0,
        period: 'monthly',
        description: 'Version control is not available in the Free plan'
      },
      {
        planType: PlanType.FREE,
        feature: 'test_runs',
        limit: 0,
        period: 'monthly',
        description: 'Test runs are not available in the Free plan'
      },

      // Pro Plan
      {
        planType: PlanType.PRO,
        feature: 'private_prompts',
        limit: 50,
        period: 'monthly',
        description: 'Create up to 50 private prompts per month'
      },
      {
        planType: PlanType.PRO,
        feature: 'prompt_runs',
        limit: 1000,
        period: 'monthly',
        description: 'Run up to 1000 prompts per month'
      },
      {
        planType: PlanType.PRO,
        feature: 'version_control',
        limit: 5,
        period: 'monthly',
        description: 'Create up to 5 versions per prompt per month'
      },
      {
        planType: PlanType.PRO,
        feature: 'test_runs',
        limit: 500,
        period: 'monthly',
        description: 'Run up to 500 test runs per month'
      },

      // Elite Plan
      {
        planType: PlanType.ELITE,
        feature: 'private_prompts',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited private prompts'
      },
      {
        planType: PlanType.ELITE,
        feature: 'prompt_runs',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited prompt runs'
      },
      {
        planType: PlanType.ELITE,
        feature: 'version_control',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited version control'
      },
      {
        planType: PlanType.ELITE,
        feature: 'test_runs',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited test runs'
      },

      // Enterprise Plan
      {
        planType: PlanType.ENTERPRISE,
        feature: 'private_prompts',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited private prompts'
      },
      {
        planType: PlanType.ENTERPRISE,
        feature: 'prompt_runs',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited prompt runs'
      },
      {
        planType: PlanType.ENTERPRISE,
        feature: 'version_control',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited version control'
      },
      {
        planType: PlanType.ENTERPRISE,
        feature: 'test_runs',
        limit: -1,
        period: 'monthly',
        description: 'Unlimited test runs'
      }
    ];

    // Insert new plan limits
    console.log('📝 Inserting new plan limits...');
    for (const limit of planLimits) {
      await prisma.planLimits.create({
        data: {
          id: uuidv4(),
          ...limit
        }
      });
    }
    console.log('✅ Plan limits seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding plan limits:', error);
    throw error;
  }
}

// Run the seeder
seedPlanLimits()
  .catch((error) => {
    console.error('❌ Error running plan limits seeder:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 