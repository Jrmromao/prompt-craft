import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSpecificUser() {
  const clerkId = 'user_33xNKHf1ie8YONDlpf2j3YgHFQH';
  
  try {
    // Create or update user
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        email: 'test@example.com',
        name: 'Test User',
        planType: 'FREE',
      },
    });

    console.log('✅ User created/updated:', user.id);

    // Sample prompts
    const samplePrompts = [
      {
        name: 'Email Marketing Assistant',
        content: 'You are an expert email marketing copywriter. Write compelling email subject lines and body content that drives engagement and conversions. Focus on:\n\n1. Attention-grabbing subject lines\n2. Personalized content\n3. Clear call-to-actions\n4. Mobile-friendly formatting\n\nAlways maintain a professional yet friendly tone.',
        description: 'AI assistant for creating effective email marketing campaigns',
        slug: 'email-marketing-assistant',
      },
      {
        name: 'Code Review Helper',
        content: 'You are a senior software engineer conducting code reviews. Analyze the provided code and give constructive feedback on:\n\n- Code quality and best practices\n- Performance optimizations\n- Security considerations\n- Readability and maintainability\n- Potential bugs or edge cases\n\nProvide specific suggestions with examples when possible.',
        description: 'AI assistant for thorough code reviews and improvements',
        slug: 'code-review-helper',
      },
      {
        name: 'Social Media Content Creator',
        content: 'You are a creative social media manager. Create engaging content for various platforms including:\n\n- Instagram captions with relevant hashtags\n- Twitter threads that spark conversation\n- LinkedIn posts for professional networking\n- TikTok video concepts\n\nAdapt tone and style to match each platform\'s audience and best practices.',
        description: 'AI assistant for creating platform-specific social media content',
        slug: 'social-media-content-creator',
      },
      {
        name: 'Meeting Notes Summarizer',
        content: 'You are an efficient meeting assistant. Transform meeting transcripts into clear, actionable summaries including:\n\n1. Key decisions made\n2. Action items with owners\n3. Important discussion points\n4. Next steps and deadlines\n5. Follow-up questions\n\nFormat the output in a professional, easy-to-scan structure.',
        description: 'AI assistant for converting meeting transcripts into organized summaries',
        slug: 'meeting-notes-summarizer',
      },
      {
        name: 'Customer Support Agent',
        content: 'You are a helpful customer support representative. Respond to customer inquiries with:\n\n- Empathy and understanding\n- Clear, step-by-step solutions\n- Proactive suggestions\n- Professional language\n- Escalation guidance when needed\n\nAlways aim to resolve issues on first contact while maintaining a positive customer experience.',
        description: 'AI assistant for handling customer support inquiries professionally',
        slug: 'customer-support-agent',
      },
    ];

    // Create prompts with versions
    for (const promptData of samplePrompts) {
      const prompt = await prisma.prompt.create({
        data: {
          ...promptData,
          userId: user.id,
          isPublic: false,
        },
      });

      // Create initial version
      await prisma.version.create({
        data: {
          content: promptData.content,
          userId: user.id,
          promptId: prompt.id,
        },
      });

      console.log('✅ Created prompt:', prompt.name);
    }

    console.log('🎉 Successfully seeded user with sample prompts!');
    console.log(`User ID: ${user.id}`);
    console.log(`Prompts created: ${samplePrompts.length}`);

  } catch (error) {
    console.error('❌ Error seeding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSpecificUser();
