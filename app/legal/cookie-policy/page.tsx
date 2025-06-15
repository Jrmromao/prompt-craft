'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | PromptHive',
  description: 'Learn about how we use cookies and similar technologies on PromptHive',
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
          <h1>Cookie Policy</h1>
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>What are Cookies?</h2>
        <p>
              Cookies are small text files that are stored on your device when you visit our website.
              They help us provide you with a better experience and enable certain features to work properly.
            </p>
          </section>

          <section>
            <h2>How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
              <li>
                <strong>Essential Cookies:</strong> Required for basic website functionality
                (e.g., authentication, security)
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings and preferences
                (e.g., language, theme)
              </li>
        </ul>
          </section>

          <section>
            <h2>Managing Cookies</h2>
            <p>You can control cookies through:</p>
        <ul>
              <li>Your browser settings</li>
              <li>Our cookie consent banner</li>
              <li>Your account preferences</li>
        </ul>
          </section>

          <section>
            <h2>Contact Us</h2>
        <p>
              If you have any questions about our use of cookies, please contact us at{' '}
              <a
                href="mailto:privacy@prompthive.co"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
                privacy@prompthive.co
          </a>
        </p>
          </section>
      </div>
      </main>
    </div>
  );
}
