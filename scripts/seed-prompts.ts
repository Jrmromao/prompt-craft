import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

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
      email: 'admin@PromptCraft.com',
      name: 'Admin User',
      role: 'ADMIN',
      planType: 'PRO',
    },
  });

  // Create tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: 'productivity', slug: 'productivity' },
      { name: 'creative', slug: 'creative' },
      { name: 'funny', slug: 'funny' },
      { name: 'seo', slug: 'seo' },
      { name: 'marketing', slug: 'marketing' },
      { name: 'business', slug: 'business' },
      { name: 'writing', slug: 'writing' },
      { name: 'coding', slug: 'coding' },
      { name: 'design', slug: 'design' },
      { name: 'education', slug: 'education' },
      { name: 'health', slug: 'health' },
      { name: 'finance', slug: 'finance' },
      { name: 'ai', slug: 'ai' },
      { name: 'social', slug: 'social' },
      { name: 'legal', slug: 'legal' },
      { name: 'travel', slug: 'travel' },
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
    {
      name: 'Business Plan Generator',
      description: 'Create a comprehensive business plan outline.',
      content:
        'Help me create a business plan for a [type of business]. Include market analysis, financial projections, and marketing strategy.',
      isPublic: true,
      isApproved: true,
      upvotes: 150,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[5].id, tagObjs[11].id],
    },
    {
      name: 'Investment Analysis',
      description: 'Analyze investment opportunities.',
      content:
        'Analyze the potential risks and returns of investing in [specific investment]. Consider market conditions, historical performance, and future outlook.',
      isPublic: true,
      isApproved: true,
      upvotes: 180,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[11].id],
    },
    {
      name: 'Blog Post Outline',
      description: 'Generate a structured blog post outline.',
      content:
        'Create a detailed outline for a blog post about [topic]. Include main points, subheadings, and key takeaways.',
      isPublic: true,
      isApproved: true,
      upvotes: 95,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[6].id],
    },
    {
      name: 'Email Template Generator',
      description: 'Create professional email templates.',
      content:
        'Write a professional email template for [purpose]. Include subject line, greeting, body, and closing.',
      isPublic: true,
      isApproved: true,
      upvotes: 110,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[6].id, tagObjs[5].id],
    },
    {
      name: 'Code Review Assistant',
      description: 'Get help reviewing your code.',
      content:
        'Review this code snippet and suggest improvements for performance, readability, and best practices: [code]',
      isPublic: true,
      isApproved: true,
      upvotes: 160,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[7].id],
    },
    {
      name: 'API Documentation Generator',
      description: 'Generate API documentation.',
      content:
        'Create comprehensive API documentation for this endpoint: [endpoint details]. Include parameters, responses, and examples.',
      isPublic: true,
      isApproved: true,
      upvotes: 130,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[7].id],
    },
    {
      name: 'UI/UX Feedback',
      description: 'Get feedback on your design.',
      content:
        'Review this UI/UX design and provide feedback on usability, accessibility, and visual appeal: [design details]',
      isPublic: true,
      isApproved: true,
      upvotes: 140,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[8].id],
    },
    {
      name: 'Color Palette Generator',
      description: 'Generate harmonious color palettes.',
      content:
        'Create a color palette for a [type of project] that conveys [mood/emotion]. Include primary, secondary, and accent colors.',
      isPublic: true,
      isApproved: true,
      upvotes: 125,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[8].id],
    },
    {
      name: 'Study Guide Creator',
      description: 'Create comprehensive study guides.',
      content:
        'Create a study guide for [subject/topic]. Include key concepts, examples, and practice questions.',
      isPublic: true,
      isApproved: true,
      upvotes: 170,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[9].id],
    },
    {
      name: 'Lesson Plan Generator',
      description: 'Generate detailed lesson plans.',
      content:
        'Create a lesson plan for teaching [subject] to [grade level]. Include objectives, activities, and assessment methods.',
      isPublic: true,
      isApproved: true,
      upvotes: 145,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[9].id],
    },
    {
      name: 'Workout Plan Generator',
      description: 'Create personalized workout plans.',
      content:
        'Design a [duration] workout plan for [fitness goal]. Include exercises, sets, reps, and rest periods.',
      isPublic: true,
      isApproved: true,
      upvotes: 155,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[10].id],
    },
    {
      name: 'Meal Planner',
      description: 'Generate healthy meal plans.',
      content:
        'Create a [duration] meal plan for [dietary requirements]. Include recipes, nutritional information, and shopping list.',
      isPublic: true,
      isApproved: true,
      upvotes: 165,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[10].id],
    },
    {
      name: 'AI Prompt Engineering Guide',
      description: 'Learn how to write effective AI prompts.',
      content:
        'Create a comprehensive guide for writing effective prompts for [AI model]. Include best practices, examples, and common pitfalls to avoid.',
      isPublic: true,
      isApproved: true,
      upvotes: 220,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[12].id],
      slug: 'ai-prompt-engineering-guide-2024',
    },
    {
      name: 'ChatGPT Business Assistant',
      description: 'Use AI to improve your business operations.',
      content:
        'How can I use ChatGPT to improve [specific business process]? Provide step-by-step instructions and best practices.',
      isPublic: true,
      isApproved: true,
      upvotes: 190,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[12].id, tagObjs[5].id],
      slug: 'chatgpt-business-assistant-guide',
    },
    {
      name: 'Viral Social Media Post',
      description: 'Create engaging social media content.',
      content:
        'Generate a viral social media post for [platform] about [topic]. Include hashtags and engagement prompts.',
      isPublic: true,
      isApproved: true,
      upvotes: 175,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[13].id, tagObjs[4].id],
      slug: 'viral-social-media-post-generator',
    },
    {
      name: 'LinkedIn Profile Optimizer',
      description: 'Optimize your LinkedIn profile for better visibility.',
      content:
        'Help me optimize my LinkedIn profile for [industry/role]. Include headline, summary, and experience section improvements.',
      isPublic: true,
      isApproved: true,
      upvotes: 165,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[13].id, tagObjs[5].id],
      slug: 'linkedin-profile-optimization-guide',
    },
    {
      name: 'Privacy Policy Generator',
      description: 'Create a compliant privacy policy.',
      content:
        'Generate a privacy policy for [type of business/website]. Include GDPR, CCPA, and other relevant compliance requirements.',
      isPublic: true,
      isApproved: true,
      upvotes: 145,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[14].id, tagObjs[5].id],
      slug: 'privacy-policy-generator-2024',
    },
    {
      name: 'Terms of Service Template',
      description: 'Generate terms of service for your platform.',
      content:
        'Create terms of service for [type of platform/service]. Include user obligations, limitations, and dispute resolution.',
      isPublic: true,
      isApproved: true,
      upvotes: 135,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[14].id],
      slug: 'terms-of-service-template-generator',
    },
    {
      name: 'Travel Itinerary Planner',
      description: 'Plan your perfect trip.',
      content:
        'Create a detailed travel itinerary for [destination] for [duration]. Include activities, accommodations, and local tips.',
      isPublic: true,
      isApproved: true,
      upvotes: 185,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[15].id],
      slug: 'travel-itinerary-planner-2024',
    },
    {
      name: 'Budget Travel Guide',
      description: 'Plan affordable travel experiences.',
      content:
        'Create a budget travel guide for [destination]. Include cost-saving tips, affordable accommodations, and free activities.',
      isPublic: true,
      isApproved: true,
      upvotes: 170,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[15].id, tagObjs[11].id],
      slug: 'budget-travel-guide-generator',
    },
    {
      name: 'Sales Pitch Generator',
      description: 'Create compelling sales pitches.',
      content:
        'Generate a sales pitch for [product/service] targeting [audience]. Include value proposition, benefits, and call to action.',
      isPublic: true,
      isApproved: true,
      upvotes: 160,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[5].id, tagObjs[4].id],
      slug: 'sales-pitch-generator-pro',
    },
    {
      name: 'Customer Service Response',
      description: 'Generate professional customer service responses.',
      content:
        'Create a professional response to a customer complaint about [issue]. Include apology, solution, and follow-up steps.',
      isPublic: true,
      isApproved: true,
      upvotes: 150,
      promptType: 'text',
      userId: user.id,
      tags: [tagObjs[5].id],
      slug: 'customer-service-response-generator',
    },
  ];

  for (const prompt of prompts) {
    await prisma.prompt.create({
      data: {
        slug:
          prompt.slug ||
          `${prompt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomUUID().slice(0, 5)}`,
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
        isPublic: prompt.isPublic,
        upvotes: prompt.upvotes,
        userId: prompt.userId,

        tags: {
          connect: prompt.tags.map(id => ({ id })),
        },
      },
    });
  }

  console.log('Seeded prompts!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
