'use client';

import { useUser } from '@clerk/nextjs';
import { NavBar } from "@/components/layout/NavBar";
import Link from "next/link";

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

export default function BlogContent() {
  const { user, isSignedIn } = useUser();
  const navUser = isSignedIn
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : undefined;

  return (
    <>
      <NavBar user={navUser} />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-background text-foreground">
        {/* Hero Section */}
        <section className="w-full max-w-2xl text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">PromptCraft Blog</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Insights, tips, and stories from the world of AI prompt engineering.
          </p>
        </section>
        {/* Blog Posts */}
        <section className="w-full max-w-3xl flex flex-col gap-8">
          {mockPosts.map((post, idx) => (
            <article key={idx} className="bg-card border border-border rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-foreground">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <div className="text-xs text-muted-foreground mb-2">{new Date(post.date).toLocaleDateString()}</div>
                <p className="text-sm text-muted-foreground mb-2">{post.summary}</p>
              </div>
              <Link href={`/blog/${post.slug}`} className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition text-sm whitespace-nowrap self-start md:self-center">Read more</Link>
            </article>
          ))}
        </section>
      </main>
    </>
  );
} 