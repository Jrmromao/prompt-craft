import { PrismaClient, Role, PlanType, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const planTypes = [PlanType.FREE, PlanType.PRO, PlanType.ELITE, PlanType.ENTERPRISE];
const roles = [Role.USER, Role.ADMIN];

async function createDummyUsers(count: number) {
  try {
    console.log(`🌱 Creating ${count} dummy users...`);
    
    const users = [];
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName });
      const name = `${firstName} ${lastName}`;
      
      const user = await prisma.user.create({
        data: {
          email,
          name,
          clerkId: `user_${faker.string.alphanumeric(20)}`,
          role: roles[Math.floor(Math.random() * roles.length)],
          planType: planTypes[Math.floor(Math.random() * planTypes.length)],
          status: UserStatus.ACTIVE,
          monthlyCredits: faker.number.int({ min: 50, max: 1000 }),
          purchasedCredits: faker.number.int({ min: 0, max: 500 }),
          creditCap: faker.number.int({ min: 100, max: 2000 }),
          lastCreditReset: faker.date.recent(),
          imageUrl: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          company: faker.company.name(),
          jobTitle: faker.person.jobTitle(),
          location: faker.location.city(),
          linkedin: `https://linkedin.com/in/${faker.internet.userName()}`,
          twitter: `https://twitter.com/${faker.internet.userName()}`,
          website: faker.internet.url(),
          emailPreferences: {
            productUpdates: faker.datatype.boolean(),
            securityAlerts: faker.datatype.boolean(),
            marketingEmails: faker.datatype.boolean()
          },
          languagePreferences: {
            language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
            dateFormat: faker.helpers.arrayElement(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
            timeFormat: faker.helpers.arrayElement(['12h', '24h'])
          },
          notificationSettings: {
            pushNotifications: faker.datatype.boolean(),
            emailNotifications: faker.datatype.boolean(),
            browserNotifications: faker.datatype.boolean()
          },
          securitySettings: {
            sessionTimeout: faker.number.int({ min: 15, max: 60 }),
            twoFactorEnabled: faker.datatype.boolean()
          },
          themeSettings: {
            theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
            accentColor: faker.helpers.arrayElement(['blue', 'teal', 'green', 'red'])
          }
        }
      });
      
      users.push(user);
      console.log(`✅ Created user ${i + 1}/${count}: ${user.email}`);
    }

    console.log('🎉 All users created successfully!');
    return users;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Create 60 dummy users
createDummyUsers(6); 