import { PrismaClient } from '@prisma/client';
import { seedCreditPackages } from './seeders/creditPackagesSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed credit packages
    await seedCreditPackages();

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
