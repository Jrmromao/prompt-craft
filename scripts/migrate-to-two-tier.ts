import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePlanTypes() {
  console.log('🔄 Starting migration to two-tier system...');

  try {
    // Update ELITE and ENTERPRISE users to PRO
    const eliteUsers = await prisma.user.updateMany({
      where: {
        planType: {
          in: ['ELITE', 'ENTERPRISE']
        }
      },
      data: {
        planType: 'PRO',
        creditCap: 1000, // PRO credit cap
        monthlyCredits: 500, // PRO monthly allocation
      }
    });

    console.log(`✅ Migrated ${eliteUsers.count} ELITE/ENTERPRISE users to PRO`);

    // Update FREE users to have correct credit allocation
    const freeUsers = await prisma.user.updateMany({
      where: {
        planType: 'FREE'
      },
      data: {
        creditCap: 100, // FREE credit cap
        monthlyCredits: 100, // FREE monthly allocation
      }
    });

    console.log(`✅ Updated ${freeUsers.count} FREE users with correct credit allocation`);

    // Update PRO users to have correct credit allocation
    const proUsers = await prisma.user.updateMany({
      where: {
        planType: 'PRO'
      },
      data: {
        creditCap: 1000, // PRO credit cap
        monthlyCredits: 500, // PRO monthly allocation
      }
    });

    console.log(`✅ Updated ${proUsers.count} PRO users with correct credit allocation`);

    // Clean up any plan limits that reference old tiers
    await prisma.planLimits.deleteMany({
      where: {
        planType: {
          in: ['ELITE', 'ENTERPRISE']
        }
      }
    });

    console.log('✅ Cleaned up old plan limits');

    // Create/update plan limits for FREE and PRO
    const planLimitsData = [
      // FREE plan limits
      { planType: 'FREE', feature: 'private_prompts', limit: 3, description: 'Maximum private prompts' },
      { planType: 'FREE', feature: 'playground_runs', limit: 50, description: 'Monthly playground runs' },
      { planType: 'FREE', feature: 'test_runs', limit: 20, description: 'Monthly test runs' },
      { planType: 'FREE', feature: 'version_control', limit: 0, description: 'Version control access' },
      { planType: 'FREE', feature: 'analytics', limit: 0, description: 'Analytics access' },
      { planType: 'FREE', feature: 'priority_support', limit: 0, description: 'Priority support access' },
      
      // PRO plan limits
      { planType: 'PRO', feature: 'private_prompts', limit: 20, description: 'Maximum private prompts' },
      { planType: 'PRO', feature: 'playground_runs', limit: -1, description: 'Unlimited playground runs' },
      { planType: 'PRO', feature: 'test_runs', limit: -1, description: 'Unlimited test runs' },
      { planType: 'PRO', feature: 'version_control', limit: 1, description: 'Version control access' },
      { planType: 'PRO', feature: 'analytics', limit: 1, description: 'Analytics access' },
      { planType: 'PRO', feature: 'priority_support', limit: 1, description: 'Priority support access' },
    ];

    for (const limit of planLimitsData) {
      await prisma.planLimits.upsert({
        where: {
          planType_feature: {
            planType: limit.planType as any,
            feature: limit.feature
          }
        },
        update: {
          limit: limit.limit,
          description: limit.description
        },
        create: limit as any
      });
    }

    console.log('✅ Created/updated plan limits for FREE and PRO tiers');

    // Update any subscriptions that reference old plan types
    // Find subscriptions with ELITE or ENTERPRISE plans and update them to PRO
    const eliteEnterprisePlans = await prisma.plan.findMany({
      where: {
        name: {
          in: ['ELITE', 'ENTERPRISE']
        }
      }
    });

    const proPlan = await prisma.plan.findFirst({
      where: { name: 'PRO' }
    });

    let subscriptionCount = 0;
    if (proPlan && eliteEnterprisePlans.length > 0) {
      const subscriptions = await prisma.subscription.updateMany({
        where: {
          planId: {
            in: eliteEnterprisePlans.map(p => p.id)
          }
        },
        data: {
          planId: proPlan.id
        }
      });
      subscriptionCount = subscriptions.count;
    }

    console.log(`✅ Updated ${subscriptionCount} subscriptions to PRO tier`);

    console.log('🎉 Migration completed successfully!');
    
    // Print summary
    const userCounts = await prisma.user.groupBy({
      by: ['planType'],
      _count: true
    });

    console.log('\n📊 Current user distribution:');
    userCounts.forEach(({ planType, _count }) => {
      console.log(`  ${planType}: ${_count} users`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migratePlanTypes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migratePlanTypes };
