'use client';

import { currentUser } from '@clerk/nextjs/server';
import { NavBar } from "@/components/layout/NavBar";
import Link from "next/link";

const mockRoles = [
  {
    title: "Frontend Engineer",
    location: "Remote / Lisbon, Portugal",
    type: "Full-time",
    description: "Build beautiful, performant UIs for the next generation of AI tools.",
  },
  {
    title: "Backend Engineer",
    location: "Remote / Lisbon, Portugal",
    type: "Full-time",
    description: "Design and scale robust APIs and infrastructure for millions of users.",
  },
  {
    title: "Product Designer",
    location: "Remote / Europe",
    type: "Contract / Freelance",
    description: "Craft intuitive, delightful user experiences for prompt creators and teams.",
  },
  {
    title: "Community Manager",
    location: "Remote",
    type: "Part-time",
    description: "Grow and support our global community of AI prompt engineers.",
  },
];

export default async function CareersContent() {
  const user = await currentUser();
  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : { name: 'Guest', email: '' };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Careers</h1>
        {/* Careers content */}
      </main>
    </div>
  );
} 