import { Period, PrismaClient } from '@prisma/client';

const db = new PrismaClient();

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
      maxPrompts: 10,
      maxTokens: 1000,
      maxTeamMembers: 1,
      features: [
        'Basic prompt types',
        'No saving prompts',
        'No prompt history'
      ],
      isEnterprise: false
    },
    {
      name: 'PRO',
      description: 'For power users and professionals',
      price: 12,
      credits: 1500,
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_pro_monthly',
      maxPrompts: 250,
      maxTokens: 150000,
      maxTeamMembers: 5,
      features: [
        'Unlimited saved prompts',
        'Share prompts',
        'Community prompt library',
        'Priority support',
        'Monthly credit reset'
      ],
      isEnterprise: false
    },
    {
      name: 'ELITE',
      description: 'For dedicated prompt engineers and professional content creators',
      price: 29.99,
      credits: 5000,
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_elite_monthly',
      maxPrompts: 1000,
      maxTokens: 500000,
      maxTeamMembers: 10,
      features: [
        'Unlimited Testing Runs',
        'Unlimited Private Prompts',
        'Advanced Analytics',
        'Bring Your Own API Key',
        'Priority Support',
        'Custom Integrations'
      ],
      isEnterprise: false
    },
    {
      name: 'ENTERPRISE',
      description: 'Custom solutions for large organizations',
      price: 0, // Custom pricing
      credits: 0, // Custom credits
      period: Period.MONTHLY,
      isActive: true,
      stripeProductId: 'prod_enterprise',
      maxPrompts: 0, // Unlimited
      maxTokens: 0, // Unlimited
      maxTeamMembers: 0, // Unlimited
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
      customLimits: {
        // Custom limits will be set per customer
        maxPrompts: null,
        maxTokens: null,
        maxTeamMembers: null
      }
    }
  ];

  for (const plan of plans) {
    await db.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  // Create a dummy user
  const user = await db.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      email: 'testuser@example.com',
      clerkId: 'testuser_clerk_id',
      name: 'Test User',
      credits: 100,
      role: 'USER',
      planType: 'FREE',
      creditCap: 1000,
    },
  });

  // Add dummy PromptGeneration records
  await db.promptGeneration.createMany({
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
  await db.creditHistory.createMany({
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

  console.log('Database has been seeded. 🌱');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
