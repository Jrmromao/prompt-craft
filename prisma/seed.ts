import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create test user with the provided Clerk ID
  const testUser = await prisma.user.upsert({
    where: { clerkId: 'user_322qhGnCTcvSvzkJ9k2zdY3wk23' },
    update: {
      monthlyCredits: 100,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-user-id-123',
      clerkId: 'user_322qhGnCTcvSvzkJ9k2zdY3wk23',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      planType: 'FREE',
      monthlyCredits: 100,
      purchasedCredits: 0,
      updatedAt: new Date(),
    }
  });

  console.log('Test user created:', testUser.clerkId);
  console.log('Database is ready!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
