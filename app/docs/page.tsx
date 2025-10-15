import Link from 'next/link';
import { ArrowRight, Zap, BookOpen, Code } from 'lucide-react';

export default function DocsHomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-16">
        <h1 className="text-5xl font-bold mb-4">Documentation</h1>
        <p className="text-xl text-gray-600">
          Everything you need to integrate PromptCraft and start tracking your AI costs.
        </p>
      </div>

      {/* Quick Start CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-8 mb-12 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get Started in 5 Minutes</h2>
            <p className="text-blue-100 mb-4">
              Install the SDK and start tracking with just 2 lines of code
            </p>
            <Link href="/docs/quickstart">
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center gap-2">
                Quick Start Guide
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <Zap className="w-24 h-24 text-blue-300 hidden lg:block" />
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <DocCard
          title="OpenAI Integration"
          description="Track GPT-4, GPT-3.5, and other OpenAI models"
          href="/docs/openai"
          icon={<BookOpen className="w-6 h-6" />}
        />
        <DocCard
          title="Anthropic Integration"
          description="Track Claude 3 Opus, Sonnet, and Haiku"
          href="/docs/anthropic"
          icon={<BookOpen className="w-6 h-6" />}
        />
        <DocCard
          title="SDK Reference"
          description="Complete SDK methods and types"
          href="/docs/sdk"
          icon={<Code className="w-6 h-6" />}
        />
        <DocCard
          title="REST API"
          description="Direct API integration without SDK"
          href="/docs/api"
          icon={<Code className="w-6 h-6" />}
        />
      </div>

      {/* Code Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Example</h2>
        <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
          <pre className="text-sm text-gray-100">
{`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const openai = new OpenAI();

// Track your API call
const start = Date.now();
const result = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
await promptcraft.trackOpenAI(params, result, Date.now() - start);`}
          </pre>
        </div>
      </div>

      {/* Popular Topics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popular Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <TopicLink href="/docs/quickstart#step-2" title="Getting Your API Key" />
          <TopicLink href="/docs/errors" title="Error Tracking" />
          <TopicLink href="/docs/openai#tagging" title="Tagging Prompts" />
          <TopicLink href="/docs/api#rate-limits" title="Rate Limits" />
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, description, href, icon }: any) {
  return (
    <Link href={href}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TopicLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <span className="text-gray-700">{title}</span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}
