"use client";
import { useUser } from '@clerk/nextjs';
import { NavBar } from "@/components/layout/NavBar";
import Link from "next/link";

export default function AboutPage() {
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
        <section className="w-full max-w-3xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">About PromptCraft</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            PromptCraft empowers creators, teams, and businesses to design, share, and discover high-quality AI prompts for every use case.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <Link href="/blog" className="px-6 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition">Read Our Blog</Link>
            <Link href="/contact" className="px-6 py-2 rounded border border-purple-500 text-purple-600 font-semibold hover:bg-purple-50 transition">Contact Us</Link>
          </div>
        </section>
        {/* What We Do */}
        <section className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-2">What is PromptCraft?</h2>
          <p className="text-md text-muted-foreground mb-4">
            PromptCraft is a collaborative platform for building, organizing, and sharing AI prompts. Whether you're a developer, marketer, educator, or enthusiast, our tools help you get the most out of AI by making prompt engineering accessible and effective.
          </p>
          <ul className="list-disc list-inside text-left text-sm md:text-base text-foreground/90 space-y-2">
            <li>Discover and use community-curated prompts for popular AI models.</li>
            <li>Save, organize, and remix prompts for your own projects.</li>
            <li>Collaborate with your team or the global community.</li>
            <li>Track usage and optimize your prompt strategies.</li>
          </ul>
        </section>
        {/* Core Values */}
        <section className="w-full max-w-4xl mb-12">
          <h2 className="text-xl font-semibold mb-3">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted rounded-xl p-6 border border-border shadow">
              <h3 className="font-bold text-purple-600 mb-2">Creativity</h3>
              <p className="text-sm text-muted-foreground">We believe in empowering everyone to create and innovate with AI.</p>
            </div>
            <div className="bg-muted rounded-xl p-6 border border-border shadow">
              <h3 className="font-bold text-pink-500 mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">We foster a collaborative environment where knowledge and ideas are shared freely.</p>
            </div>
            <div className="bg-muted rounded-xl p-6 border border-border shadow">
              <h3 className="font-bold text-blue-500 mb-2">Trust</h3>
              <p className="text-sm text-muted-foreground">We are committed to transparency, privacy, and ethical AI use.</p>
            </div>
          </div>
        </section>
        {/* Call to Action */}
        <section className="w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-2">Join the PromptCraft Community</h2>
          <p className="text-md text-muted-foreground mb-6">Sign up today and start crafting the future of AI, together.</p>
          <Link href="/sign-up" className="px-8 py-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition">Get Started</Link>
        </section>
      </main>
    </>
  );
} 