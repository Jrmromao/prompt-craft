'use client';

import Link from 'next/link';
import { NavBar } from '@/components/layout/NavBar';
import { AuthOptionsBar } from '@/components/layout/AuthOptionsBar';

interface BlogContentProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  } | null;
}

const mockPosts = [
  {
    title: 'Welcome to PromptHive: The Future of AI Prompt Engineering',
    date: '2024-06-01',
    summary:
      'Discover how PromptHive empowers creators and teams to build, share, and optimize AI prompts for every use case.',
    slug: 'welcome-to-PromptHive',
  },
  {
    title: '5 Tips for Writing Better AI Prompts',
    date: '2024-05-20',
    summary:
      'Learn actionable strategies to craft more effective prompts and get the most out of your favorite AI models.',
    slug: '5-tips-for-better-prompts',
  },
  {
    title: 'Community Spotlight: Top Prompts of the Month',
    date: '2024-05-10',
    summary:
      'See what the PromptHive community is creating and get inspired by the most popular prompts this month.',
    slug: 'community-spotlight-may-2024',
  },
];

export default function BlogContent({ user }: BlogContentProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Blog</h1>
        <div className="grid gap-8">
          {mockPosts.map((post, index) => (
            <article key={index} className="border-b pb-8">
              <Link
                href={`/blog/${post.slug}`}
                className="block transition-opacity hover:opacity-80"
              >
                <h2 className="mb-2 text-2xl font-semibold">{post.title}</h2>
                <time className="mb-3 block text-sm text-gray-600 dark:text-gray-400">
                  {post.date}
                </time>
                <p className="text-gray-700 dark:text-gray-300">{post.summary}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
