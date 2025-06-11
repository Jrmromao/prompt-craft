'use client';

import { useUser } from '@clerk/nextjs';
import { Metadata } from 'next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableOfContents } from '../../../components/TableOfContents';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | PromptHive.co',
  description: 'Read our Terms of Service to understand your rights and responsibilities when using PromptHive.co.',
};

export default function TermsContent() {
  const { user } = useUser();

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'definitions', title: 'Definitions' },
    { id: 'account', title: 'Account Terms' },
    { id: 'usage', title: 'Usage Terms' },
    { id: 'content', title: 'Content and Intellectual Property' },
    { id: 'privacy', title: 'Privacy and Data' },
    { id: 'payments', title: 'Payments and Subscriptions' },
    { id: 'termination', title: 'Termination' },
    { id: 'disclaimer', title: 'Disclaimer and Limitation of Liability' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Information' },
  ];

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
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Table of Contents */}
          <div className="hidden lg:block lg:w-64">
            <div className="sticky top-8">
              <TableOfContents sections={sections} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
            <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
              <p className="lead">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section id="introduction">
                <h2>1. Introduction</h2>
                <p>
                  Welcome to <strong>PromptHive.co</strong>! These Terms of Service ("Terms") govern your
                  access to and use of PromptHive.co's website, services, and applications (collectively,
                  the "Services"). By accessing or using our Services, you agree to be bound by these
                  Terms.
                </p>
              </section>

              <section id="definitions">
                <h2>2. Definitions</h2>
                <ul>
                  <li>
                    <strong>"Service"</strong> refers to PromptHive.co's platform, including all features,
                    content, and functionality.
                  </li>
                  <li>
                    <strong>"User"</strong> means any individual or entity that accesses or uses the
                    Service.
                  </li>
                  <li>
                    <strong>"Content"</strong> includes any text, prompts, images, or other materials
                    uploaded, downloaded, or appearing on the Service.
                  </li>
                  <li>
                    <strong>"Subscription"</strong> refers to any paid plan or service offering.
                  </li>
                </ul>
              </section>

              <section id="account">
                <h2>3. Account Terms</h2>
                <ul>
                  <li>You must be at least 13 years old to use the Service.</li>
                  <li>You must provide accurate and complete information when creating an account.</li>
                  <li>You are responsible for maintaining the security of your account credentials.</li>
                  <li>You must notify us immediately of any unauthorized access to your account.</li>
                  <li>We reserve the right to refuse service to anyone for any reason.</li>
                </ul>
              </section>

              <section id="usage">
                <h2>4. Usage Terms</h2>
                <p>When using PromptHive.co, you agree not to:</p>
                <ul>
                  <li>Violate any laws or regulations.</li>
                  <li>Infringe on the rights of others.</li>
                  <li>Use the Service for any illegal or unauthorized purpose.</li>
                  <li>Attempt to gain unauthorized access to any part of the Service.</li>
                  <li>Interfere with or disrupt the Service or servers.</li>
                  <li>Use the Service to generate harmful or malicious content.</li>
                  <li>Attempt to reverse engineer or decompile the Service.</li>
                </ul>
              </section>

              <section id="content">
                <h2>5. Content and Intellectual Property</h2>
                <h3>5.1 Your Content</h3>
                <ul>
                  <li>You retain ownership of the content you create using our Service.</li>
                  <li>You grant us a worldwide, non-exclusive license to use, store, and display your content.</li>
                  <li>You are responsible for ensuring you have the necessary rights to share your content.</li>
                </ul>

                <h3>5.2 Our Content</h3>
                <ul>
                  <li>All content provided by PromptHive.co is protected by intellectual property rights.</li>
                  <li>You may not copy, modify, or distribute our content without permission.</li>
                  <li>Our trademarks and branding may not be used without written consent.</li>
                </ul>
              </section>

              <section id="privacy">
                <h2>6. Privacy and Data</h2>
                <ul>
                  <li>We collect and process data as described in our Privacy Policy.</li>
                  <li>You consent to our data practices by using the Service.</li>
                  <li>We implement reasonable security measures to protect your data.</li>
                  <li>You are responsible for the data you share through the Service.</li>
                </ul>
              </section>

              <section id="payments">
                <h2>7. Payments and Subscriptions</h2>
                <ul>
                  <li>Subscription fees are billed in advance on a recurring basis.</li>
                  <li>You can cancel your subscription at any time.</li>
                  <li>Refunds are handled according to our Refund Policy.</li>
                  <li>We may change our pricing with notice to you.</li>
                </ul>
              </section>

              <section id="termination">
                <h2>8. Termination</h2>
                <ul>
                  <li>We may terminate or suspend your access to the Service at any time.</li>
                  <li>You may terminate your account at any time.</li>
                  <li>Upon termination, your right to use the Service will immediately cease.</li>
                  <li>Some provisions of these Terms will survive termination.</li>
                </ul>
              </section>

              <section id="disclaimer">
                <h2>9. Disclaimer and Limitation of Liability</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT
                  RESPONSIBLE FOR ANY DAMAGES ARISING FROM THE USE OF OUR SERVICE. OUR LIABILITY IS
                  LIMITED TO THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
                </p>
              </section>

              <section id="changes">
                <h2>10. Changes to Terms</h2>
                <p>
                  We may modify these Terms at any time. We will notify you of significant changes.
                  Your continued use of the Service after changes constitutes acceptance of the new
                  Terms.
                </p>
              </section>

              <section id="contact">
                <h2>11. Contact Information</h2>
                <p>
                  For questions about these Terms, please contact us at{' '}
                  <a
                    href="mailto:legal@prompthive.co"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    legal@prompthive.co
                  </a>
                  .
                </p>
              </section>

              <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By using PromptHive.co, you acknowledge that you have read, understood, and agree to
                  be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
