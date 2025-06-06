import { PrismaClient, Period } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create plans
  const plans = [
    {
      name: 'FREE',
      description:
        'Perfect for trying out PromptCraft. Includes basic features and 10 credits per month.',
      price: 0,
      credits: 10,
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_free_plan',
    },
    {
      name: 'LITE',
      description:
        'For regular users who need more power. Get 250 credits weekly and access to advanced features.',
      price: 9.99,
      credits: 250,
      period: Period.WEEKLY,
      isActive: true,
      stripeProductId: 'prod_lite_weekly_plan',
    },
    {
      name: 'PRO',
      description:
        'For power users and professionals. Get 1500 credits monthly, priority support, and all premium features.',
      price: 29.99,
      credits: 1500,
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_pro_monthly_plan',
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log('Plans have been seeded. 🌱');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
