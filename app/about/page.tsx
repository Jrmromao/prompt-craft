"use client";
import { currentUser } from '@clerk/nextjs/server';
import { NavBar } from "@/components/layout/NavBar";
import Link from "next/link";

export default async function AboutPage() {
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
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        {/* About content */}
      </main>
    </div>
  );
} 