'use client';

import { useUser } from '@clerk/nextjs';
import { NavBar } from "@/components/layout/NavBar";

export default function TermsContent() {
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
        <section className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6 text-center">Terms of Service</h1>
          <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
            <p>Welcome to <strong>PromptCraft</strong>! Please read these Terms of Service ("Terms") carefully before using our platform. By accessing or using PromptCraft, you agree to these Terms.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By using PromptCraft, you agree to follow these Terms. If you do not agree, please do not use our services.</p>

            <h2>2. Using PromptCraft</h2>
            <ul>
              <li>You must be at least 13 years old.</li>
              <li>You are responsible for your account and all activity under it.</li>
              <li>Do not use PromptCraft for anything illegal, harmful, or abusive.</li>
            </ul>

            <h2>3. Intellectual Property</h2>
            <p>All content, trademarks, and data on PromptCraft belong to PromptCraft, Inc. or our licensors. You may not copy, reuse, or distribute our content without permission.</p>

            <h2>4. Your Content</h2>
            <ul>
              <li>You own the prompts and content you create.</li>
              <li>By submitting content, you give us permission to use, display, and share it on PromptCraft.</li>
            </ul>

            <h2>5. Account Suspension or Termination</h2>
            <p>We may suspend or terminate your access to PromptCraft at any time, with or without notice, if you violate these Terms or for any other reason.</p>

            <h2>6. Disclaimer</h2>
            <p>PromptCraft is provided "as is" and without warranties. We are not responsible for any damages or losses from using our platform.</p>

            <h2>7. Changes to These Terms</h2>
            <p>We may update these Terms at any time. If you continue to use PromptCraft after changes, you accept the new Terms.</p>

            <h2>8. Contact Us</h2>
            <p>Questions? Email us at <a href="mailto:egal@PromptCraft.co">egal@PromptCraft.co</a>.</p>
          </div>
        </section>
      </main>
    </>
  );
} 