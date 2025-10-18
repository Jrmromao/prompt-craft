import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function seedUserData() {
  const clerkId = 'user_33xNKHf1ie8YONDlpf2j3YgHFQH'
  
  // Check if user exists or create
  let user = await prisma.user.findUnique({
    where: { clerkId }
  })
  
  if (!user) {
    console.log('User not found, creating user...')
    user = await prisma.user.create({
      data: {
        clerkId,
        email: 'test@example.com',
        name: 'Test User',
        username: `user_${Date.now()}`,
        planType: 'PRO',
        monthlyCredits: 1000,
        purchasedCredits: 500
      }
    })
  }
  
  console.log(`Using user ID: ${user.id}`)
  
  // Add sample prompt runs
  await prisma.promptRun.createMany({
    data: [
      {
        id: randomUUID(),
        userId: user.id,
        provider: 'deepseek',
        model: 'deepseek-chat',
        input: 'Write a marketing email for a SaaS product',
        output: 'Subject: Transform Your Workflow Today\n\nDear [Name],\n\nDiscover how our platform can streamline your processes...',
        tokensUsed: 150,
        totalTokens: 150,
        inputTokens: 50,
        outputTokens: 100,
        cost: 0.02,
        latency: 1200,
        success: true
      },
      {
        id: randomUUID(),
        userId: user.id,
        provider: 'openai',
        model: 'gpt-4',
        input: 'Create a product description for AI writing tool',
        output: 'Introducing PromptCraft - the ultimate AI-powered writing assistant that transforms your ideas into compelling content...',
        tokensUsed: 200,
        totalTokens: 200,
        inputTokens: 75,
        outputTokens: 125,
        cost: 0.15,
        latency: 2100,
        success: true
      }
    ]
  })
  
  // Add credit history
  await prisma.creditHistory.createMany({
    data: [
      {
        id: randomUUID(),
        userId: user.id,
        amount: 1000,
        type: 'SUBSCRIPTION',
        description: 'Monthly Pro plan credits'
      },
      {
        id: randomUUID(),
        userId: user.id,
        amount: 500,
        type: 'TOP_UP',
        description: 'Additional credit purchase'
      },
      {
        id: randomUUID(),
        userId: user.id,
        amount: -150,
        type: 'USAGE',
        description: 'DeepSeek API usage'
      }
    ]
  })
  
  // Add notifications
  await prisma.notification.createMany({
    data: [
      {
        id: randomUUID(),
        userId: user.id,
        type: 'WELCOME',
        title: 'Welcome to PromptCraft!',
        message: 'Get started with your first AI prompt',
        read: false,
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        userId: user.id,
        type: 'CREDIT_LOW',
        title: 'Credits Running Low',
        message: 'You have 350 credits remaining',
        read: true,
        updatedAt: new Date()
      }
    ]
  })
  
  console.log('✅ User data seeded successfully')
  console.log(`User: ${user.email} (${user.clerkId})`)
  console.log(`Credits: ${user.monthlyCredits + user.purchasedCredits}`)
}

seedUserData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
