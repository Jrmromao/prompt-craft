'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-2 rounded-md bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
    </div>
  );
}

export default function QuickStartPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Documentation
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
      <p className="text-xl text-gray-600 mb-8">Start saving 50-80% on AI costs in 5 minutes.</p>

      <div className="bg-blue-50 border border-blue-200 p-4 mb-8 rounded-lg">
        <p className="text-blue-900 font-medium mb-1">🎉 New in v3.0.0</p>
        <p className="text-blue-800 text-sm">Redis caching, quality monitoring, AI optimization, and real-time savings tracking</p>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 mb-12 rounded-lg">
        <p className="text-green-900 font-medium mb-1">💰 Save money automatically</p>
        <p className="text-green-800 text-sm">Enable auto-optimization and smart routing to cut costs by 50-80%</p>
      </div>

      <div className="space-y-16">
        {/* Step 1 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
            <span className="text-sm text-gray-500 ml-auto">1 minute</span>
          </div>
          <ol className="space-y-2 text-gray-700 ml-13">
            <li>1. Go to <a href="/" className="text-blue-600 hover:underline">promptcraft.app</a></li>
            <li>2. Click "Start Tracking Free"</li>
            <li>3. Sign up with email or Google/GitHub</li>
            <li>4. You're in! Free tier includes 1,000 runs/month</li>
          </ol>
        </div>

        {/* Step 2 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Get Your API Key</h2>
            <span className="text-sm text-gray-500 ml-auto">1 minute</span>
          </div>
          <ol className="space-y-2 text-gray-700 ml-13 mb-4">
            <li>1. Go to <Link href="/settings" className="text-blue-600 hover:underline">Settings</Link></li>
            <li>2. Click "Create Key"</li>
            <li>3. Name it (e.g., "Production")</li>
            <li>4. <strong>Copy the key now</strong> - you won't see it again!</li>
            <li>5. Save it to your <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env</code> file</li>
          </ol>
          <CodeBlock code="PROMPTCRAFT_API_KEY=pc_your_key_here" />
        </div>

        {/* Step 3 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Install SDK</h2>
            <span className="text-sm text-gray-500 ml-auto">30 seconds</span>
          </div>
          <CodeBlock code="npm install promptcraft-sdk" />
        </div>

        {/* Step 4 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
              4
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add 2 Lines of Code</h2>
            <span className="text-sm text-gray-500 ml-auto">2 minutes</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-3 ml-13">For OpenAI (Recommended - Auto-saving):</h3>
          <CodeBlock 
            language="typescript"
            code={`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const openai = new OpenAI();
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  autoOptimize: true,    // 🚀 Saves 50-80% on tokens
  smartRouting: true,    // 🚀 Routes to cheapest model
  enableCache: true,     // 🚀 Saves 80% on repeated queries
  costLimit: 0.10        // 🚀 Prevents budget overruns
});

// Wrap your client - savings happen automatically!
const tracked = promptcraft.wrapOpenAI(openai);

// Use it exactly like normal OpenAI
const result = await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
// ✅ Prompt optimized, routed to cheaper model, cached, and tracked!`}
          />

          <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4 ml-13">
            <p className="text-sm text-green-900">
              <strong>💰 Money-saving features:</strong> autoOptimize reduces tokens by 50-80%, smartRouting uses GPT-3.5 for simple queries (20x cheaper), and caching saves 80% on repeated prompts.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-8 ml-13">For Anthropic:</h3>
          <CodeBlock 
            language="typescript"
            code={`import PromptCraft from 'promptcraft-sdk';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

// Wrap and use
const tracked = promptcraft.wrapAnthropic(anthropic);

const result = await tracked.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
});
// ✅ Done!`}
          />
        </div>

        {/* Step 5 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
              5
            </div>
            <h2 className="text-2xl font-bold text-gray-900">View Your Dashboard</h2>
            <span className="text-sm text-gray-500 ml-auto">30 seconds</span>
          </div>
          <ol className="space-y-2 text-gray-700 ml-13">
            <li>1. Make a few API calls</li>
            <li>2. Go to <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link></li>
            <li>3. See your costs in real-time! 🎉</li>
          </ol>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 p-6 rounded-lg mt-16">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">You're Saving Money! 💰</h3>
            <p className="text-green-800 mb-3">
              Your AI costs are being optimized automatically. Check your dashboard to see:
            </p>
            <ul className="text-green-800 space-y-1 list-disc list-inside">
              <li>Real savings from smart routing</li>
              <li>Token reduction from optimization</li>
              <li>Cache hit rate and savings</li>
              <li>Total $ saved this month</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-6">Next Steps</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/settings" className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Set Budget Alerts</h3>
          <p className="text-sm text-gray-600">Get notified before you overspend</p>
        </Link>
        <Link href="/docs/openai#tagging" className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Tag Your Prompts</h3>
          <p className="text-sm text-gray-600">Track costs by use case</p>
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-6">Common Issues</h2>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-3">API key not working</h4>
          <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
            <li>Check it starts with <code className="bg-gray-100 px-2 py-1 rounded">pc_</code></li>
            <li>Make sure you copied the whole key</li>
            <li>Verify it wasn't deleted in Settings</li>
          </ul>
        </div>
        <div className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-3">Not seeing data</h4>
          <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
            <li>Wait 1-2 minutes for sync</li>
            <li>Check browser console for errors</li>
            <li>Verify you're calling trackOpenAI() or trackAnthropic()</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Full Guide:</strong> <Link href="/docs/openai" className="text-blue-600 hover:underline">OpenAI Integration</Link></p>
          <p><strong>API Docs:</strong> <Link href="/docs/api" className="text-blue-600 hover:underline">API Reference</Link></p>
          <p><strong>Email:</strong> <a href="mailto:support@promptcraft.app" className="text-blue-600 hover:underline">support@promptcraft.app</a></p>
        </div>
      </div>
    </div>
  );
}
