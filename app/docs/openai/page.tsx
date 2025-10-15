'use client';

import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
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

export default function OpenAIDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">OpenAI Integration</h1>
      <p className="text-xl text-gray-600 mb-12">
        Track your OpenAI API costs including GPT-4, GPT-3.5-Turbo, and other models.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Installation</h2>
      <CodeBlock code="npm install promptcraft-sdk openai" language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Basic Usage</h2>
      <CodeBlock code={`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

// Initialize
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Make your API call
const params = {
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
};

const start = Date.now();
const result = await openai.chat.completions.create(params);

// Track the call
await promptcraft.trackOpenAI(params, result, Date.now() - start);

console.log(result.choices[0].message.content);`} />

      <h2 id="tagging" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tagging Prompts</h2>
      <p className="text-gray-700 mb-4">
        Pass a <code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> to group and analyze specific prompts in your dashboard:
      </p>
      <CodeBlock code={`const params = {
  model: 'gpt-4',
  messages: [...]
};

const start = Date.now();
const result = await openai.chat.completions.create(params);

// Pass promptId as 4th parameter
await promptcraft.trackOpenAI(
  params, 
  result, 
  Date.now() - start,
  'customer-support-v2'
);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Error Handling</h2>
      <p className="text-gray-700 mb-4">Always track failed calls to monitor error rates:</p>
      <CodeBlock code={`const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, Date.now() - start);
  return result;
} catch (error) {
  await promptcraft.trackError(
    params.model,
    JSON.stringify(params.messages),
    error,
    Date.now() - start
  );
  throw error;
}`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Supported Models</h2>
      <p className="text-gray-700 mb-4">All OpenAI models are supported:</p>
      <ul className="space-y-2 text-gray-700 list-disc list-inside mb-4">
        <li><strong>GPT-4</strong> - $0.03 per 1K tokens</li>
        <li><strong>GPT-4 Turbo</strong> - $0.01 per 1K tokens</li>
        <li><strong>GPT-3.5-Turbo</strong> - $0.0005 per 1K tokens</li>
      </ul>
      <p className="text-sm text-gray-600">
        Costs are calculated automatically based on official OpenAI pricing.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Gets Tracked</h2>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li>Model name (e.g., gpt-4, gpt-3.5-turbo)</li>
        <li>Token usage (input + output)</li>
        <li>Cost (calculated from tokens × model price)</li>
        <li>Latency (response time in ms)</li>
        <li>Success/failure status</li>
        <li>Timestamp</li>
        <li>Prompt ID (if provided)</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Best Practices</h2>
      <ol className="space-y-2 text-gray-700 list-decimal list-inside">
        <li><strong>Always track errors</strong> - Use try/catch with trackError()</li>
        <li><strong>Use prompt IDs</strong> - Tag prompts for better analytics</li>
        <li><strong>Monitor latency</strong> - Slow responses cost more</li>
        <li><strong>Set budget alerts</strong> - Get notified before overspending</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Next Steps</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/docs/anthropic" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">Anthropic Integration</p>
        </Link>
        <Link href="/docs/errors" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">Error Tracking Guide</p>
        </Link>
        <Link href="/docs/sdk" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">SDK Reference</p>
        </Link>
      </div>
    </div>
  );
}
