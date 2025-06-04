// scripts/backfillSlugs.ts
import { PrismaClient } from "@prisma/client";
import { aiSlugify } from "../services/slugService";

const prisma = new PrismaClient();

async function main() {
  const prompts = await prisma.prompt.findMany({ where: { slug: null } });
  for (const prompt of prompts) {
    const slug = await aiSlugify(prompt.name, prompt.description || "");
    // Ensure uniqueness (append id if needed)
    let uniqueSlug = slug;
    let i = 1;
    while (
      await prisma.prompt.findFirst({
        where: { slug: uniqueSlug, id: { not: prompt.id } },
      })
    ) {
      uniqueSlug = `${slug}-${i}`;
      i++;
    }
    await prisma.prompt.update({
      where: { id: prompt.id },
      data: { slug: uniqueSlug },
    });
    console.log(`Updated prompt ${prompt.id} with slug: ${uniqueSlug}`);
  }
  await prisma.$disconnect();
}

main();