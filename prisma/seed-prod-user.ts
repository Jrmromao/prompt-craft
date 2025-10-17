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
      status: 'ACTIVE',
      username: '@user490035',
      emailPreferences: {
        productUpdates: true,
        securityAlerts: true,
        marketingEmails: true,
      },
      notificationSettings: {
        pushNotifications: true,
        emailNotifications: true,
        browserNotifications: true,
      },
      securitySettings: {
        sessionTimeout: 30,
        twoFactorEnabled: false,
      },
      themeSettings: {
        theme: 'system',
        accentColor: 'purple',
      },
      dataRetentionPolicy: {
        autoDelete: false,
        retentionPeriod: 365,
      },
      dataProcessingConsent: {
        analytics: false,
        marketing: false,
        thirdParty: false,
      },
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
