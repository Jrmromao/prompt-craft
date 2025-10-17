import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding analytics data...');

  // Use specific production user
  const user = await prisma.user.findUnique({
    where: { id: 'cmgnyuzil00008o66zgu5ru66' }
  });

  if (!user) {
    console.error('❌ User not found.');
    process.exit(1);
  }

  console.log(`✅ Using user: ${user.email}`);

  // Generate 90 days of prompt runs
  const runs = [];
  const now = Date.now();
  const providers = ['openai', 'anthropic', 'gemini'];
  const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku', 'gemini-pro'];
  const prompts = [
    'Summarize this article',
    'Write a product description',
    'Generate code for a function',
    'Translate to Spanish',
    'Analyze sentiment',
  ];

  for (let day = 90; day >= 0; day--) {
    const date = new Date(now - day * 24 * 60 * 60 * 1000);
    
    // More runs on recent days
    const runsPerDay = Math.floor(10 + Math.random() * 20 + (90 - day) / 3);
    
    for (let i = 0; i < runsPerDay; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      // Realistic token counts
      const inputTokens = Math.floor(50 + Math.random() * 500);
      const outputTokens = Math.floor(100 + Math.random() * 800);
      
      // Cost based on model
      let costPer1kTokens = 0.002; // gpt-3.5-turbo
      if (model === 'gpt-4') costPer1kTokens = 0.03;
      if (model.includes('claude-3-sonnet')) costPer1kTokens = 0.015;
      if (model.includes('claude-3-haiku')) costPer1kTokens = 0.001;
      if (model === 'gemini-pro') costPer1kTokens = 0.0005;
      
      const cost = ((inputTokens + outputTokens) / 1000) * costPer1kTokens;
      
      // Some runs are cached (40% for recent days)
      const cached = day < 30 && Math.random() < 0.4;
      const actualCost = cached ? 0 : cost;
      
      // Some runs are routed to cheaper models (30%)
      const routed = Math.random() < 0.3;
      const requestedModel = routed ? 'gpt-4' : model;
      
      // Latency
      const latency = Math.floor(500 + Math.random() * 2000);
      
      // Success rate 98%
      const success = Math.random() < 0.98;
      
      runs.push({
        id: `run_${Date.now()}_${day}_${i}`,
        userId: user.id,
        provider,
        model,
        requestedModel,
        input: JSON.stringify({ prompt, messages: [{ role: 'user', content: prompt }] }),
        output: success ? 'Generated response...' : '',
        inputTokens,
        outputTokens,
        tokensUsed: inputTokens + outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost: actualCost,
        savings: cached ? cost : 0,
        latency,
        success,
        ...(success ? {} : { error: 'Rate limit exceeded' }),
        createdAt: new Date(date.getTime() + i * 60000), // Spread throughout day
      });
    }
  }

  // Insert in batches
  console.log(`📊 Creating ${runs.length} prompt runs...`);
  const batchSize = 100;
  for (let i = 0; i < runs.length; i += batchSize) {
    const batch = runs.slice(i, i + batchSize);
    await prisma.promptRun.createMany({
      data: batch as any,
      skipDuplicates: true,
    });
    console.log(`   Inserted ${Math.min(i + batchSize, runs.length)}/${runs.length}`);
  }

  // Calculate totals
  const totalRuns = runs.length;
  const totalCost = runs.reduce((sum, r) => sum + r.cost, 0);
  const totalSavings = runs.reduce((sum, r) => sum + r.savings, 0);
  const routedRuns = runs.filter(r => r.requestedModel !== r.model).length;
  const successfulRuns = runs.filter(r => r.success).length;

  console.log('\n📈 Analytics Summary:');
  console.log(`   Total runs: ${totalRuns}`);
  console.log(`   Total cost: $${totalCost.toFixed(2)}`);
  console.log(`   Total savings: $${totalSavings.toFixed(2)}`);
  console.log(`   Routed runs: ${routedRuns} (${((routedRuns / totalRuns) * 100).toFixed(1)}%)`);
  console.log(`   Success rate: ${((successfulRuns / totalRuns) * 100).toFixed(1)}%`);
  console.log(`   Avg cost per run: $${(totalCost / totalRuns).toFixed(4)}`);

  console.log('\n✅ Seeding complete!');
  console.log('\n🎯 Now check your dashboard to see the data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
