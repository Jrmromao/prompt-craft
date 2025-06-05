"use client";
import { useUser } from '@clerk/nextjs';
import React from "react";
import { NavBar } from "@/components/layout/NavBar";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6 text-center">Privacy Policy</h1>
          <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
            <p>Your privacy matters to us. This Privacy Policy explains how <strong>PromptCraft</strong> collects, uses, and protects your information.</p>

            <h2>1. What We Collect</h2>
            <ul>
              <li>Account details (name, email, etc.)</li>
              <li>Usage data and analytics</li>
              <li>Content you create and share</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To provide and improve our services</li>
              <li>To communicate with you</li>
              <li>To keep PromptCraft secure</li>
            </ul>

            <h2>3. Sharing Your Information</h2>
            <ul>
              <li>We do <strong>not</strong> sell your personal information.</li>
              <li>We may share data with trusted service providers to run PromptCraft.</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>We use industry-standard security measures, but no system is 100% secure.</p>

            <h2>5. Your Choices</h2>
            <ul>
              <li>You can update or delete your account at any time.</li>
              <li>Contact us for data requests or questions.</li>
            </ul>

            <h2>6. Changes to This Policy</h2>
            <p>We may update this Privacy Policy. Using PromptCraft after changes means you accept the new policy.</p>

            <h2>7. Contact Us</h2>
            <p>Questions? Email us at <a href="mailto:legal@promptcraft.com">legal@promptcraft.com</a>.</p>
          </div>
        </section>
      </main>
    </>
  );
} 