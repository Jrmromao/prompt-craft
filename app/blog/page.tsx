import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - CostLens.dev',
  description: 'Insights on AI cost optimization, LLM pricing, and developer tools.',
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: {
      Author: {
        select: {
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header with gradient */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h1 className="text-6xl font-serif font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Insights on AI cost optimization and smart routing strategies.
          </p>
        </div>
      </div>

      {/* Posts with cards */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-lg transition-all duration-200">
                  <div className="space-y-4">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
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
                          <span>{post.readTime} min read</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-tight">
                      {post.title}
                    </h2>

                    {/* Subtitle */}
                    {post.subtitle && (
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {post.subtitle}
                      </p>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs font-medium bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-500">
              No posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Newsletter with gradient */}
      <div className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-10 text-center border border-sky-200 dark:border-sky-800">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get new posts via email
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join developers optimizing their AI costs.
            </p>
            <form action="/api/newsletter/subscribe" method="POST" className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
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
