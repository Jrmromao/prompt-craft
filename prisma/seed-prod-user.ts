import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating production user...');

  const user = await prisma.user.upsert({
    where: { id: 'cmgnyuzil00008o66zgu5ru66' },
    update: {},
    create: {
      id: 'cmgnyuzil00008o66zgu5ru66',
      email: 'jrmromao@gmail.com',
      clerkId: 'user_33xNKHf1ie8YONDlpf2j3YgHFQH',
      name: 'Joao Filipe Romao',
      role: 'SUPER_ADMIN',
      monthlyRunLimit: 100000,
      status: 'ACTIVE',
      username: '@user490035',
      emailVerified: true,
      emailPreferences: {
        productUpdates: true,
        securityAlerts: true,
        marketingEmails: true,
      },
      notificationPreferences: {
        pushNotifications: true,
        emailNotifications: true,
        browserNotifications: true,
      },
      securitySettings: {
        sessionTimeout: 30,
        twoFactorEnabled: false,
      },
      uiPreferences: {
        theme: 'system',
        accentColor: 'purple',
      },
      dataRetentionSettings: {
        autoDelete: false,
        dataCategories: ['personal', 'usage', 'analytics'],
        retentionPeriod: 365,
      },
      consentSettings: {
        analytics: false,
        marketing: false,
        thirdParty: false,
      },
      totalCredits: 999999,
      creditsUsed: 0,
    },
  });

  console.log('✅ User created:', user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
