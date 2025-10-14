const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function extractOptimizedPrompt(content) {
  try {
    // Remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(cleanContent);
    return parsed.optimizedPrompt || content;
  } catch (error) {
    // If not JSON, return as-is
    return content;
  }
}

async function fixJsonContent() {
  try {
    // Get all prompts that might have JSON content
    const prompts = await prisma.prompt.findMany({
      where: {
        content: {
          contains: 'optimizedPrompt'
        }
      },
      select: { id: true, name: true, content: true }
    });

    console.log(`Found ${prompts.length} prompts with JSON content to fix...`);

    for (const prompt of prompts) {
      const cleanContent = extractOptimizedPrompt(prompt.content);
      
      if (cleanContent !== prompt.content) {
        await prisma.prompt.update({
          where: { id: prompt.id },
          data: { content: cleanContent }
        });

        // Also update the version
        await prisma.version.updateMany({
          where: { promptId: prompt.id },
          data: { content: cleanContent }
        });

        console.log(`✅ Fixed "${prompt.name}"`);
      }
    }

    console.log('🎉 All JSON content fixed!');

  } catch (error) {
    console.error('❌ Error fixing content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixJsonContent();
