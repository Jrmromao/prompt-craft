import { PrismaClient, Period } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create plans
  const plans = [
    {
      name: 'FREE',
      description: 'Perfect for trying out PromptCraft',
      price: 0,
      credits: 10,
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_free',
    },
    {
      name: 'LITE',
      description: 'For regular users who need more power',
      price: 3,
      credits: 250,
      period: Period.WEEKLY,
      isActive: true,
      stripeProductId: 'prod_lite_weekly',
    },
    {
      name: 'PRO',
      description: 'For power users and professionals',
      price: 12,
      credits: 1500,
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_pro_monthly',
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 