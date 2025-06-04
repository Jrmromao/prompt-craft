import { prisma } from '../lib/prisma';

async function main() {
  // await prisma.prompt.deleteMany(); // Clean slate
  // await prisma.tag.deleteMany();
  // await prisma.user.deleteMany({});

  // Upsert dummy users
  // const users = [
  //   { clerkId: 'seed-user-1', email: 'user1@example.com', name: 'Seed User 1' },
  //   { clerkId: 'seed-user-2', email: 'user2@example.com', name: 'Seed User 2' },
  //   { clerkId: 'seed-user-3', email: 'user3@example.com', name: 'Seed User 3' },
  //   { clerkId: 'seed-user-4', email: 'user4@example.com', name: 'Seed User 4' },
  //   { clerkId: 'seed-user-5', email: 'user5@example.com', name: 'Seed User 5' },
  // ];
  // for (const user of users) {
  //   await prisma.user.upsert({
  //     where: { clerkId: user.clerkId },
  //     update: {},
  //     create: {
  //       clerkId: user.clerkId,
  //       email: user.email,
  //       name: user.name,
  //     },
  //   });
  // }

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
      userId: 'user_2xxz0T8rjcLGHcvR6Zs9bZmQjOT',
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
      userId: 'user_2xxz0T8rjcLGHcvR6Zs9bZmQjOT',
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
      userId: 'user_2xxz0T8rjcLGHcvR6Zs9bZmQjOT',
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
      userId: 'user_2xxz0T8rjcLGHcvR6Zs9bZmQjOT',
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
      userId: 'user_2xxz0T8rjcLGHcvR6Zs9bZmQjOT',
      tags: [tagObjs[2].id],
    },
  ];

  for (const prompt of prompts) {
    await prisma.prompt.create({
      data: {
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