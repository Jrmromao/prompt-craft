import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRoles() {
  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to update`);

    // Update each user's role if needed
    for (const user of users) {
      // If the user is an admin, check if they should be a SUPER_ADMIN
      if (user.role === 'ADMIN') {
        // You can add your logic here to determine if an admin should be a SUPER_ADMIN
        // For now, we'll keep them as ADMIN
        console.log(`Keeping user ${user.email} as ADMIN`);
      }
    }

    console.log('User roles update completed');
  } catch (error) {
    console.error('Error updating user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRoles(); 