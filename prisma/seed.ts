import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create plans
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for individuals getting started with prompt engineering',
      price: 0,
      period: 'month',
      currency: 'USD',
      features: [
        'Basic Prompt Management',
        'Community Access',
        'Basic Analytics'
      ],
      isEnterprise: false,
      stripeProductId: 'prod_free',
      stripePriceId: 'price_free',
      stripeAnnualPriceId: null
    },
    {
      name: 'Pro',
      description: 'For professionals who need more power and flexibility',
      price: 29,
      period: 'month',
      currency: 'USD',
      features: [
        'Advanced Prompt Management',
        'Team Collaboration',
        'Advanced Analytics',
        'Custom Models'
      ],
      isEnterprise: false,
      stripeProductId: 'prod_pro',
      stripePriceId: 'price_pro',
      stripeAnnualPriceId: 'price_pro_annual'
    },
    {
      name: 'Elite',
      description: 'For teams that need enterprise-grade features and support',
      price: 99,
      period: 'month',
      currency: 'USD',
      features: [
        'Enterprise Features',
        'Unlimited Team Members',
        'Priority Support',
        'Custom Integrations'
      ],
      isEnterprise: false,
      stripeProductId: 'prod_elite',
      stripePriceId: 'price_elite',
      stripeAnnualPriceId: 'price_elite_annual'
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: -1, // Custom pricing
      period: 'month',
      currency: 'USD',
      features: [
        'Custom Solutions',
        'Dedicated Support',
        'SLA Guarantee',
        'Custom Development'
      ],
      isEnterprise: true,
      stripeProductId: 'prod_enterprise',
      stripePriceId: 'price_enterprise',
      stripeAnnualPriceId: null
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    });
  }

  // Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      email: 'testuser@example.com',
      clerkId: 'testuser_clerk_id',
      name: 'Test User',
      credits: 100,
      role: 'USER',
      planType: 'PRO',
      creditCap: 1000,
    },
  });

  // Add dummy PromptGeneration records
  await prisma.promptGeneration.createMany({
    data: [
      {
        userId: user.id,
        promptType: 'gpt-4',
        input: 'Write a poem about the sea.',
        output: 'The sea is vast and blue... (poem)',
        creditsUsed: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      },
      {
        userId: user.id,
        promptType: 'gpt-4',
        input: 'Summarize the theory of relativity.',
        output: "Einstein's theory of relativity explains... (summary)",
        creditsUsed: 5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        userId: user.id,
        promptType: 'deepseek',
        input: 'Generate a business plan for a coffee shop.',
        output: 'Business plan: 1. Market analysis... (plan)',
        creditsUsed: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      },
    ],
  });

  // Add dummy CreditHistory records
  await prisma.creditHistory.createMany({
    data: [
      {
        userId: user.id,
        amount: 100,
        type: 'INITIAL',
        description: 'Initial credits',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
      {
        userId: user.id,
        amount: -3,
        type: 'USAGE',
        description: 'Prompt: Write a poem about the sea.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      },
      {
        userId: user.id,
        amount: -5,
        type: 'USAGE',
        description: 'Prompt: Summarize the theory of relativity.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        userId: user.id,
        amount: -4,
        type: 'USAGE',
        description: 'Prompt: Generate a business plan for a coffee shop.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ],
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
