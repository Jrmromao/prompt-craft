'use client';

import Link from 'next/link';
import { ArrowRight, Zap, BookOpen, Code, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-4 right-4 p-2 rounded-md bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
    </div>
  );
}

export default function DocsHomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Developer Documentation
        </div>
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Documentation</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Everything you need to integrate CostLens and start tracking your AI costs in minutes.
        </p>
      </div>

      {/* Quick Start CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 mb-12 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get Started in 5 Minutes</h2>
            <p className="text-blue-100 mb-4 max-w-md">
              Wrap your OpenAI/Anthropic client and get automatic tracking, caching, retries, and error handling!
            </p>
            <Link href="/docs/quickstart">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                Quick Start Guide
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <Zap className="w-32 h-32 text-blue-300 hidden lg:block opacity-50" />
        </div>
      </div>

      {/* Features Highlight */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
          <h3 className="font-semibold text-green-900 mb-2">✨ Auto-Tracking</h3>
          <p className="text-sm text-green-800">Wrap your client once, tracking happens automatically</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
          <h3 className="font-semibold text-purple-900 mb-2">💾 Smart Caching</h3>
          <p className="text-sm text-purple-800">Reduce API costs by up to 80% with intelligent caching</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-5">
          <h3 className="font-semibold text-orange-900 mb-2">🔄 Auto-Retry</h3>
          <p className="text-sm text-orange-800">Built-in exponential backoff for failed requests</p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Integration Guides</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <DocCard
            title="OpenAI Integration"
            description="Track GPT-4, GPT-3.5, and other OpenAI models with automatic cost calculation"
            href="/docs/openai"
            icon={<BookOpen className="w-6 h-6" />}
            badge="Most Popular"
          />
          <DocCard
            title="Anthropic Integration"
            description="Track Claude 3 Opus, Sonnet, and Haiku with real-time analytics"
            href="/docs/anthropic"
            icon={<BookOpen className="w-6 h-6" />}
          />
          <DocCard
            title="Google Gemini"
            description="Track Gemini Pro, 1.5 Pro, and Flash models with cost tracking"
            href="/docs/gemini"
            icon={<BookOpen className="w-6 h-6" />}
          />
          <DocCard
            title="xAI Grok"
            description="Track Grok API calls with real-time cost monitoring"
            href="/docs/grok"
            icon={<BookOpen className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Reference */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">API Reference</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <DocCard
            title="SDK Reference"
            description="Complete SDK methods, types, and configuration options"
            href="/docs/sdk"
            icon={<Code className="w-6 h-6" />}
          />
          <DocCard
            title="REST API"
            description="Direct API integration without SDK for any language"
            href="/docs/api"
            icon={<Code className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Code Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Example</h2>
        <p className="text-gray-600 mb-4">
          Wrap your client and get automatic tracking:
        </p>
        <CodeBlock code={`import { CostLens } from 'costlens';
import OpenAI from 'openai';

const openai = new OpenAI();
const optirelay = new CostLens({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true,  // Optional: enable caching
  maxRetries: 3       // Optional: auto-retry
});

// Wrap once
const tracked = optirelay.wrapOpenAI(openai);

// Use normally - tracking happens automatically!
const result = await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});`} />
      </div>

      {/* Popular Topics */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Popular Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <TopicLink href="/docs/quickstart#step-2" title="Getting Your API Key" />
          <TopicLink href="/docs/errors" title="Error Tracking" />
          <TopicLink href="/docs/openai#tagging" title="Tagging Prompts" />
          <TopicLink href="/docs/api#rate-limits" title="Rate Limits & Pricing" />
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, description, href, icon, badge }: any) {
  return (
    <Link href={href}>
      <div className="relative border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all h-full group">
        {badge && (
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {badge}
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TopicLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group">
        <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{title}</span>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </Link>
  );
}
