'use client';

import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { AuthOptionsBar } from "@/components/layout/AuthOptionsBar";

interface BlogContentProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  } | null;
}

const mockPosts = [
  {
    title: "Welcome to PromptCraft: The Future of AI Prompt Engineering",
    date: "2024-06-01",
    summary: "Discover how PromptCraft empowers creators and teams to build, share, and optimize AI prompts for every use case.",
    slug: "welcome-to-PromptCraft",
  },
  {
    title: "5 Tips for Writing Better AI Prompts",
    date: "2024-05-20",
    summary: "Learn actionable strategies to craft more effective prompts and get the most out of your favorite AI models.",
    slug: "5-tips-for-better-prompts",
  },
  {
    title: "Community Spotlight: Top Prompts of the Month",
    date: "2024-05-10",
    summary: "See what the PromptCraft community is creating and get inspired by the most popular prompts this month.",
    slug: "community-spotlight-may-2024",
  },
];

export default function BlogContent({ user }: BlogContentProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {user ? <NavBar user={user} /> : <AuthOptionsBar />}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid gap-8">
          {mockPosts.map((post, index) => (
            <article key={index} className="border-b pb-8">
              <Link href={`/blog/${post.slug}`} className="block hover:opacity-80 transition-opacity">
                <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                <time className="text-gray-600 dark:text-gray-400 text-sm mb-3 block">{post.date}</time>
                <p className="text-gray-700 dark:text-gray-300">{post.summary}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
} 