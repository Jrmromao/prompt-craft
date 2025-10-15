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

export default function AnthropicDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Anthropic (Claude) Integration</h1>
      <p className="text-xl text-gray-600 mb-12">
        Track your Anthropic API costs including Claude 3 Opus, Sonnet, and Haiku.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Installation</h2>
      <CodeBlock code="npm install promptcraft-sdk @anthropic-ai/sdk" language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Basic Usage</h2>
      <CodeBlock code={`import PromptCraft from 'promptcraft-sdk';
import Anthropic from '@anthropic-ai/sdk';

// Initialize
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Make your API call
const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
};

const start = Date.now();
const result = await anthropic.messages.create(params);

// Track the call
await promptcraft.trackAnthropic(params, result, Date.now() - start);

console.log(result.content[0].text);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tagging Prompts</h2>
      <p className="text-gray-700 mb-4">
        Pass a <code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> to group and analyze specific prompts:
      </p>
      <CodeBlock code={`const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [...]
};

const start = Date.now();
const result = await anthropic.messages.create(params);

// Pass promptId as 4th parameter
await promptcraft.trackAnthropic(
  params,
  result,
  Date.now() - start,
  'content-generation-v1'
);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Error Handling</h2>
      <CodeBlock code={`const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await promptcraft.trackAnthropic(params, result, Date.now() - start);
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
      <ul className="space-y-2 text-gray-700 list-disc list-inside mb-4">
        <li><strong>Claude 3 Opus</strong> - $0.015 per 1K tokens (most capable)</li>
        <li><strong>Claude 3 Sonnet</strong> - $0.003 per 1K tokens (balanced)</li>
        <li><strong>Claude 3 Haiku</strong> - $0.00025 per 1K tokens (fastest)</li>
      </ul>
      <p className="text-sm text-gray-600">
        Costs are calculated automatically based on official Anthropic pricing.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Gets Tracked</h2>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li>Model name (e.g., claude-3-opus-20240229)</li>
        <li>Token usage (input + output)</li>
        <li>Cost (calculated from tokens × model price)</li>
        <li>Latency (response time in ms)</li>
        <li>Success/failure status</li>
        <li>Timestamp</li>
        <li>Prompt ID (if provided)</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Best Practices</h2>
      <ol className="space-y-2 text-gray-700 list-decimal list-inside">
        <li><strong>Choose the right model</strong> - Haiku is 60x cheaper than Opus</li>
        <li><strong>Track errors</strong> - Monitor failure rates</li>
        <li><strong>Use prompt IDs</strong> - Analyze performance by use case</li>
        <li><strong>Set max_tokens</strong> - Control output length and cost</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Next Steps</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/docs/openai" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">OpenAI Integration</p>
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
