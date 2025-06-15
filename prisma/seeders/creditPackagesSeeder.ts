import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCreditPackages() {
  console.log('🌱 Seeding credit packages...');

  // Delete existing credit packages
  console.log('🗑️  Deleting existing credit packages...');
  await prisma.creditPackage.deleteMany();
  console.log('✅ Existing credit packages deleted');

  // Create credit packages
  const creditPackages = [
    {
      name: 'Basic',
      amount: 100,
      price: 10,
      stripePriceId: process.env.STRIPE_CREDIT_PACKAGE_BASIC || 'basic-123',
      description: 'Perfect for trying out our AI models',
      isPopular: false,
      bonusCredits: 0,
    },
    {
      name: 'Standard',
      amount: 500,
      price: 45,
      stripePriceId: process.env.STRIPE_CREDIT_PACKAGE_STANDARD || 'standard-456',
      description: 'Most popular choice for regular users',
      isPopular: true,
      bonusCredits: 50,
    },
    {
      name: 'Premium',
      amount: 1000,
      price: 80,
      stripePriceId: process.env.STRIPE_CREDIT_PACKAGE_PREMIUM || 'premium-789',
      description: 'Great value for power users',
      isPopular: false,
      bonusCredits: 150,
    },
    {
      name: 'Enterprise',
      amount: 2500,
      price: 180,
      stripePriceId: process.env.STRIPE_CREDIT_PACKAGE_ENTERPRISE || 'enterprise-101',
      description: 'Best value for heavy usage',
      isPopular: false,
      bonusCredits: 500,
    },
  ];

  console.log('📝 Inserting new credit packages...');
  for (const pkg of creditPackages) {
    await prisma.creditPackage.create({
      data: pkg,
    });
  }

  console.log('✅ Credit packages seeded successfully');
} 