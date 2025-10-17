import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const metadata = {
  title: 'Blog - AI Cost Optimization Insights',
  description: 'Real-world strategies for cutting AI costs, optimizing LLM performance, and building smarter applications.',
  alternates: {
    canonical: 'https://costlens.dev/blog',
  },
};

interface Post {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
}

function getAllPosts(): Post[] {
  const contentDir = path.join(process.cwd(), 'content/blog');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const slug = file.replace('.md', '');
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    return {
      slug,
      title: data.title,
      subtitle: data.subtitle,
      excerpt: data.excerpt,
      tags: data.tags || [],
      readTime: data.readTime || 5,
      publishedAt: data.publishedAt || new Date().toISOString(),
    };
  }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export default function BlogPage() {
  const posts = getAllPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CostLens.dev Blog',
    description: 'Real-world strategies for cutting AI costs, optimizing LLM performance, and building smarter applications.',
    url: 'https://costlens.dev/blog',
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.subtitle,
      datePublished: post.publishedAt,
      url: `https://costlens.dev/blog/${post.slug}`,
    })),
  };

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 via-blue-50 to-white dark:from-sky-950/20 dark:via-blue-950/20 dark:to-gray-950 pt-24 pb-12 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
              Blog
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              AI Cost Optimization Insights
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Real-world strategies, benchmarks, and guides for cutting AI costs by 60-80%
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured Article */}
        {featuredPost && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Featured
              </span>
            </div>
            <article className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-200 dark:border-gray-800">
              <div className="p-10">
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <time className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {featuredPost.excerpt || featuredPost.subtitle}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime} min read
                    </span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold group-hover:gap-3 transition-all"
                  >
                    Read article <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Articles List */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              All Articles
            </h2>
          </div>

          <div className="grid gap-8">
            {regularPosts.map((post) => (
              <article key={post.slug} className="group">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <time className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-tight">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
                    {post.excerpt || post.subtitle}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.readTime} min
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Read more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-20">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-12 text-center border border-sky-200 dark:border-sky-800">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get new posts via email
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join developers optimizing their AI costs. No spam, just insights.
            </p>
            <form action="/api/newsletter/subscribe" method="POST" className="flex gap-4 max-w-lg mx-auto">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-6 py-4 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
