'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, Code, FileText } from 'lucide-react';
import Link from 'next/link';

const docs = [
  {
    title: 'Quick Start',
    description: 'Get started in 5 minutes',
    icon: Zap,
    href: '/docs/quickstart',
    time: '5 min read',
  },
  {
    title: 'Developer Guide',
    description: 'Complete integration guide',
    icon: BookOpen,
    href: '/docs/guide',
    time: '15 min read',
  },
  {
    title: 'API Reference',
    description: 'SDK and REST API documentation',
    icon: Code,
    href: '/docs/api',
    time: '10 min read',
  },
];

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Documentation</h1>
        <p className="text-xl text-gray-600">
          Everything you need to integrate PromptCraft
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {docs.map((doc) => (
          <Link key={doc.href} href={doc.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <doc.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    <p className="text-xs text-gray-500">{doc.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Popular Topics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="space-y-3">
          <TopicLink href="/docs/quickstart#step-2" title="Getting Your API Key" />
          <TopicLink href="/docs/guide#openai" title="OpenAI Integration" />
          <TopicLink href="/docs/guide#anthropic" title="Anthropic (Claude) Integration" />
          <TopicLink href="/docs/guide#tagging-prompts" title="Tagging Prompts for Analytics" />
          <TopicLink href="/docs/guide#error-tracking" title="Error Tracking" />
          <TopicLink href="/docs/api#rate-limits" title="Rate Limits" />
        </div>
      </div>

      {/* Code Example */}
      <Card className="mb-12">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Example</h2>
          <p className="text-gray-600 mb-4">
            Add 2 lines of code to start tracking your AI costs:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const openai = new OpenAI();

const params = { model: 'gpt-4', messages: [...] };

const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);`}
          </pre>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-2">
                Get help from our team
              </p>
              <a href="mailto:support@promptcraft.app" className="text-blue-600 hover:underline text-sm">
                support@promptcraft.app
              </a>
            </div>
            <div>
              <h3 className="font-semibold mb-2">GitHub</h3>
              <p className="text-sm text-gray-600 mb-2">
                View source code and examples
              </p>
              <a href="https://github.com/promptcraft/sdk" className="text-blue-600 hover:underline text-sm">
                github.com/promptcraft/sdk
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TopicLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <FileText className="w-5 h-5 text-gray-400" />
        <span className="text-gray-700 hover:text-blue-600">{title}</span>
      </div>
    </Link>
  );
}
