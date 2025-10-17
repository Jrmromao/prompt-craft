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
      <CodeBlock code="npm install optirelay-sdk @anthropic-ai/sdk" language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Quick Start (Recommended)</h2>
      <p className="text-gray-700 mb-4">Use the wrapper for automatic tracking:</p>
      <CodeBlock code={`import { CostLens } from 'costlens';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const optirelay = new CostLens({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

// Wrap your client
const tracked = optirelay.wrapAnthropic(anthropic);

// Use it exactly like normal Anthropic
const result = await tracked.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
});
// ✅ Automatically tracked!`} />

      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6 rounded-r">
        <p className="text-sm text-green-900">
          <strong>✨ Benefits:</strong> No timing code, automatic error tracking, built-in retries, and optional caching!
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Advanced: Caching</h2>
      <p className="text-gray-700 mb-4">Save costs by caching responses:</p>
      <CodeBlock code={`const optirelay = new CostLens({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true
});

const tracked = optirelay.wrapAnthropic(anthropic);

const result = await tracked.messages.create(
  { model: 'claude-3-opus', max_tokens: 1024, messages: [...] },
  { cacheTTL: 3600000 }  // Cache for 1 hour
);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Manual Tracking (Legacy)</h2>
      <p className="text-gray-700 mb-4">For more control, track manually:</p>
      <CodeBlock code={`import { CostLens } from 'costlens';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const optirelay = new CostLens({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
const result = await anthropic.messages.create(params);
await optirelay.trackAnthropic(params, result, Date.now() - start);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Basic Usage (Old Approach)</h2>
      <CodeBlock code={`import { CostLens } from 'costlens';
import Anthropic from '@anthropic-ai/sdk';

// Initialize
const optirelay = new CostLens({ 
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
await optirelay.trackAnthropic(params, result, Date.now() - start);

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
await optirelay.trackAnthropic(
  params,
  result,
  Date.now() - start,
  'content-generation-v1'
);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Error Handling</h2>
      <CodeBlock code={`const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await optirelay.trackAnthropic(params, result, Date.now() - start);
  return result;
} catch (error) {
  await optirelay.trackError(
    'anthropic',
    params.model,
    JSON.stringify(params.messages),
    error,
    Date.now() - start
  );
  throw error;
}`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Supported Models</h2>
      <p className="text-gray-700 mb-4">Example pricing:</p>
      <ul className="space-y-2 text-gray-700 list-disc list-inside mb-4">
        <li><strong>Claude 3.5 Sonnet</strong> - $0.003 input / $0.015 output per 1K tokens</li>
        <li><strong>Claude 3 Opus</strong> - $0.015 input / $0.075 output per 1K tokens</li>
        <li><strong>Claude 3 Haiku</strong> - $0.00025 input / $0.00125 output per 1K tokens</li>
      </ul>
      <p className="text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <strong>Note:</strong> Pricing shown is approximate. Actual costs calculated based on official Anthropic pricing at time of API call. Visit <a href="https://anthropic.com/pricing" target="_blank" rel="noopener" className="text-blue-600 hover:underline">anthropic.com/pricing</a> for current rates.
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
