import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const prisma = new PrismaClient();

async function main() {
  const contentDir = path.join(process.cwd(), 'content/blog');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found. Please create a user first.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    const slug = file.replace('.md', '');

    const existing = await prisma.blogPost.findUnique({ where: { slug } });

    if (existing) {
      console.log(`Updating: ${data.title}`);
      await prisma.blogPost.update({
        where: { slug },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          excerpt: data.excerpt,
          content,
          tags: data.tags || [],
          readTime: data.readTime || 5,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
          published: true,
        },
      });
    } else {
      console.log(`Creating: ${data.title}`);
      await prisma.blogPost.create({
        data: {
          slug,
          title: data.title,
          subtitle: data.subtitle,
          excerpt: data.excerpt,
          content,
          tags: data.tags || [],
          readTime: data.readTime || 5,
          authorId: user.id,
          published: true,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        },
      });
    }
  }

  console.log('✅ Import complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
