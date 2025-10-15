const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upgradeToPro() {
  const clerkId = 'user_33xNKHf1ie8YONDlpf2j3YgHFQH';
  
  try {
    // Update user to PRO plan with unlimited credits
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        planType: 'PRO',
        monthlyCredits: 999999, // Effectively unlimited
        purchasedCredits: 0,
      },
    });

    console.log('✅ User upgraded to PRO:', user.id);
    console.log(`Plan: ${user.planType}`);
    console.log(`Credits: ${user.monthlyCredits} (unlimited)`);

  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeToPro();
