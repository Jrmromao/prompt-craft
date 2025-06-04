// @ts-nocheck
const { PrismaClient } = require('@prisma/client');


const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function main() {
  // await prisma.prompt.deleteMany(); // Clean slate
  // await prisma.tag.deleteMany();
  // await prisma.user.deleteMany({});

  // First, create the user
  const user = await prisma.user.upsert({
    where: { clerkId: 'user_2y3AM5C06LBwfYwSMU0LyQ3HpoD' },
    update: {},
    create: {
      clerkId: 'user_2y3AM5C06LBwfYwSMU0LyQ3HpoD',
      email: 'admin@prompthive.com',
      name: 'Admin User',
      role: 'ADMIN',
      planType: 'PRO'
    },
  });

  // Create tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: 'productivity' },
      { name: 'creative' },
      { name: 'funny' },
      { name: 'seo' },
      { name: 'marketing' },
    ],
    skipDuplicates: true,
  });

  const tagObjs = await prisma.tag.findMany();

  const prompts = [
    {
      name: 'Boost Productivity',
      description: 'A prompt to help you get more done.',
      content: 'What are 3 things I can do today to be more productive?',
      isPublic: true,
      isApproved: true,
      upvotes: 120,
      promptType: 'text',
      userId: user.id, // Use the created user's ID
      tags: [tagObjs[0].id],
    },
    {
      name: 'Creative Brainstorm',
      description: 'Unlock your creativity with this prompt.',
      content: 'Generate 5 unique ideas for a new app.',
      isPublic: true,
      isApproved: false,
      upvotes: 10,
      promptType: 'text',
      userId: user.id, // Use the created user's ID
      tags: [tagObjs[1].id],
    },
    {
      name: 'SEO Optimizer',
      description: 'Improve your website SEO.',
      content: 'List 10 keywords to target for my website.',
      isPublic: true,
      isApproved: true,
      upvotes: 200,
      promptType: 'text',
      userId: user.id, // Use the created user's ID
      tags: [tagObjs[3].id],
    },
    {
      name: 'Marketing Magic',
      description: 'Marketing ideas for startups.',
      content: 'Suggest 3 viral marketing strategies.',
      isPublic: false,
      isApproved: false,
      upvotes: 0,
      promptType: 'text',
      userId: user.id, // Use the created user's ID
      tags: [tagObjs[4].id],
    },
    {
      name: 'Joke Generator',
      description: 'Generate a funny joke.',
      content: 'Tell me a joke about programmers.',
      isPublic: true,
      isApproved: true,
      upvotes: 75,
      promptType: 'text',
      userId: user.id, // Use the created user's ID
      tags: [tagObjs[2].id],
    },
  ];

  for (const prompt of prompts) {
    await prisma.prompt.create({
      data: {
        slug: `${prompt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomUUID().slice(0, 5)}`,
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
        isPublic: prompt.isPublic,
        isApproved: prompt.isApproved,
        upvotes: prompt.upvotes,
        promptType: prompt.promptType,
        userId: prompt.userId,
        
        tags: {
          connect: prompt.tags.map((id) => ({ id })),
        },
      },
    });
  }

  console.log('Seeded prompts!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 