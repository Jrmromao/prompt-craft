'use client';

import { useUser } from '@clerk/nextjs';
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

export default function CareersContent() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">Careers at PromptCraft</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Join us in shaping the future of AI prompt engineering. We're building a diverse, remote-first team passionate about creativity, technology, and community.
          </p>
        </section>
        {/* Open Roles */}
        <section className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Open Positions</h2>
          <div className="flex flex-col gap-6">
            {mockRoles.map((role, idx) => (
              <div key={idx} className="border border-border rounded-xl p-6 bg-muted/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{role.title}</h3>
                  <div className="text-xs text-muted-foreground mb-2">{role.location} &bull; {role.type}</div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
                <Link href="/contact" className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition text-sm whitespace-nowrap">Apply</Link>
              </div>
            ))}
          </div>
        </section>
        {/* Call to Action */}
        <section className="w-full max-w-2xl text-center">
          <h2 className="text-xl font-bold mb-2">Don't see your dream role?</h2>
          <p className="text-md text-muted-foreground mb-6">We're always looking for talented people. <Link href="/contact" className="underline">Reach out</Link> and tell us how you can make a difference at PromptCraft.</p>
        </section>
      </main>
    </>
  );
} 