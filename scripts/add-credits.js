const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCredits() {
  const clerkId = 'user_33xNKHf1ie8YONDlpf2j3YgHFQH';
  
  try {
    // Update user credits
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        monthlyCredits: 100,
        purchasedCredits: 50,
      },
    });

    console.log('✅ Credits added to user:', user.id);
    console.log(`Monthly credits: ${user.monthlyCredits}`);
    console.log(`Purchased credits: ${user.purchasedCredits}`);

  } catch (error) {
    console.error('❌ Error adding credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCredits();
