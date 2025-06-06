'use client';

import Link from "next/link";

interface BlogContentProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  };
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
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        {/* Blog content */}
      </main>
    </div>
  );
} 