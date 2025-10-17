import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: {
      Author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CostLens.dev Blog</title>
    <link>https://costlens.dev/blog</link>
    <description>Insights on AI cost optimization, LLM pricing, and developer tools</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://costlens.dev/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://costlens.dev/blog/${post.slug}</link>
      <guid>https://costlens.dev/blog/${post.slug}</guid>
      <pubDate>${post.publishedAt?.toUTCString()}</pubDate>
      <author>${post.Author.name}</author>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
      ${post.tags.map((tag) => `<category>${tag}</category>`).join('\n      ')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
