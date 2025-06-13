import { PrismaClient } from '@prisma/client';
import { seedPlanLimits } from './seeders/planLimitsSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Run all seeders
    await seedPlanLimits();

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
