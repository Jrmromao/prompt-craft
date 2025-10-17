import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LikeButton } from '@/components/LikeButton';
import { Calendar, Clock, Eye } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { prisma } from '@/lib/prisma';

interface Post {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
}

function getPost(slug: string): Post | null {
  try {
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    return {
      slug,
      title: data.title,
      subtitle: data.subtitle,
      excerpt: data.excerpt,
      content,
      tags: data.tags || [],
      readTime: data.readTime || 5,
      publishedAt: data.publishedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function getAllPosts(): Post[] {
  const contentDir = path.join(process.cwd(), 'content/blog');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const slug = file.replace('.md', '');
    return getPost(slug)!;
  }).filter(Boolean);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return {};

  return {
    title: `${post.title} - CostLens.dev`,
    description: post.excerpt || post.subtitle,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.subtitle,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.subtitle,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://costlens.dev/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  // Get or create blog post stats in database
  let dbPost = await prisma.blogPost.findUnique({ where: { slug } });
  
  if (!dbPost) {
    // Create entry if doesn't exist
    const user = await prisma.user.findFirst();
    if (user) {
      dbPost = await prisma.blogPost.create({
        data: {
          slug,
          title: post.title,
          subtitle: post.subtitle,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags,
          readTime: post.readTime,
          authorId: user.id,
          published: true,
          publishedAt: new Date(post.publishedAt),
        },
      });
    }
  }

  // Increment view count
  if (dbPost) {
    await prisma.blogPost.update({
      where: { id: dbPost.id },
      data: { views: { increment: 1 } },
    });
  }

  const views = dbPost?.views || 0;
  const likes = dbPost?.likes || 0;

  // Configure marked with proper options
  marked.use({
    breaks: true,
    gfm: true,
  });

  // Remove the first H1 from markdown content to avoid duplication with header
  let processedContent = post.content;
  const h1Match = processedContent.match(/^#\s+(.+)$/m);
  if (h1Match) {
    processedContent = processedContent.replace(/^#\s+.+$/m, '');
  }

  const htmlContent = marked.parse(processedContent);

  // Get related posts by tags
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => p.slug !== slug && p.tags.some(tag => post.tags.includes(tag)))
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.subtitle,
    image: 'https://costlens.dev/og-image.png',
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: 'CostLens Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CostLens.dev',
      logo: {
        '@type': 'ImageObject',
        url: 'https://costlens.dev/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://costlens.dev/blog/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header with Breadcrumbs */}
      <div className="border-b border-gray-200 dark:border-gray-900 bg-gradient-to-br from-sky-50/30 to-blue-50/30 dark:from-sky-950/10 dark:to-blue-950/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title },
          ]} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            {/* Article Header */}
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {post.subtitle && (
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {post.subtitle}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-gray-600 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-6">
                  <time className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {post.readTime} min read
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {views.toLocaleString()} views
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <LikeButton slug={slug} initialLikes={likes} />
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div 
              className="prose prose-xl max-w-none prose-slate dark:prose-invert
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:border-b prose-h2:border-sky-200 dark:prose-h2:border-sky-800 prose-h2:pb-3
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-code:text-sky-600 dark:prose-code:text-sky-400 prose-code:bg-sky-50 dark:prose-code:bg-sky-900/30 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-gray-800 prose-pre:text-gray-100 prose-pre:rounded-2xl prose-pre:p-8 prose-pre:overflow-x-auto prose-pre:shadow-2xl prose-pre:border prose-pre:border-gray-700 prose-pre:relative
                prose-pre:before:content-[''] prose-pre:before:absolute prose-pre:before:top-0 prose-pre:before:left-0 prose-pre:before:right-0 prose-pre:before:h-1 prose-pre:before:bg-gradient-to-r prose-pre:before:from-sky-500 prose-pre:before:via-blue-500 prose-pre:before:to-purple-500 prose-pre:before:rounded-t-2xl
                prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-sky-50 dark:prose-blockquote:bg-sky-900/20 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
                prose-img:rounded-xl prose-img:shadow-xl prose-img:mx-auto
                prose-hr:border-gray-200 dark:prose-hr:border-gray-800 prose-hr:my-12"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Newsletter */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-sky-200 dark:border-sky-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Get Updates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  New cost optimization insights weekly
                </p>
                <form action="/api/newsletter/subscribe" method="POST" className="space-y-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Author Info */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  About the Author
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CT</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">CostLens Team</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI Cost Optimization Experts</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We help developers optimize their AI costs by up to 80% through smart routing and provider selection.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {related.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-600">
                    <span>{related.readTime} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
