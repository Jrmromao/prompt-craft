import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return {};

  return {
    title: `${post.title} - CostLens.dev`,
    description: post.excerpt || post.subtitle,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      Author: {
        select: {
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Minimal Header */}
      <div className="border-b border-gray-200 dark:border-gray-900">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <header className="py-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-500 mb-10 leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {/* Meta - Minimal */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-600 pb-10 border-b border-gray-200 dark:border-gray-900">
            <div className="flex items-center gap-3">
              {post.Author.imageUrl && (
                <img
                  src={post.Author.imageUrl}
                  alt={post.Author.name || 'Author'}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <span className="text-gray-900 dark:text-white">
                {post.Author.name}
              </span>
            </div>
            <span>·</span>
            <time dateTime={post.publishedAt?.toISOString()}>
              {post.publishedAt?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            {post.readTime && (
              <>
                <span>·</span>
                <span>{post.readTime} min</span>
              </>
            )}
          </div>
        </header>

        {/* Content - Clean typography */}
        <div className="pb-16">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-6 leading-tight">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-xl text-gray-700 dark:text-gray-400 leading-relaxed mb-8 font-serif">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="my-8 space-y-2 text-xl text-gray-700 dark:text-gray-400 font-serif">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-8 space-y-2 text-xl text-gray-700 dark:text-gray-400 list-decimal list-inside font-serif">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed ml-6">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900 dark:text-white">
                  {children}
                </strong>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-base font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="text-gray-100 font-mono text-sm">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="my-8 p-6 bg-gray-900 dark:bg-black rounded overflow-x-auto text-gray-100 font-mono text-sm">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-8 pl-6 border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-900/10 py-4 pr-6 rounded-r italic text-xl text-gray-700 dark:text-gray-400 font-serif">
                  {children}
                </blockquote>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-sky-600 dark:text-sky-400 underline hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Newsletter with gradient */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-10 text-center border border-sky-200 dark:border-sky-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Get new posts via email
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join developers optimizing their AI costs.
            </p>
            <form action="/api/newsletter/subscribe" method="POST" className="max-w-sm mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
