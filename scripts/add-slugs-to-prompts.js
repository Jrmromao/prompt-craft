const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateSlug(name) {
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
}

async function addSlugsToPrompts() {
  try {
    // Get all prompts without proper slugs or with duplicate slugs
    const prompts = await prisma.prompt.findMany({
      select: { id: true, name: true, slug: true }
    });

    console.log(`Found ${prompts.length} prompts to process...`);

    for (const prompt of prompts) {
      // Generate new unique slug
      const newSlug = generateSlug(prompt.name);
      
      await prisma.prompt.update({
        where: { id: prompt.id },
        data: { slug: newSlug }
      });

      console.log(`✅ Updated "${prompt.name}" -> slug: "${newSlug}"`);
    }

    console.log('🎉 All prompts updated with unique slugs!');

  } catch (error) {
    console.error('❌ Error updating slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSlugsToPrompts();
