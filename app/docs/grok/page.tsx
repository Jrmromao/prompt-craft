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

export default function GrokDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">xAI Grok Integration</h1>
      <p className="text-xl text-gray-600 mb-12">
        Track your xAI Grok API costs with real-time analytics.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Installation</h2>
      <p className="text-gray-700 mb-4">
        Grok uses the OpenAI SDK (compatible API). Install both packages:
      </p>
      <CodeBlock code="npm install costlens openai" language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Basic Usage</h2>
      <CodeBlock code={`import OpenAI from 'openai';
import { CostLens } from 'costlens';

// Initialize
const costlens = new CostLens({ 
  apiKey: process.env.COSTLENS_API_KEY 
});
const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

// Make your API call
const params = {
  model: 'grok-beta',
  messages: [
    { role: 'system', content: 'You are Grok, a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
};

const start = Date.now();
const result = await grok.chat.completions.create(params);

// Track the call
await costlens.trackGrok(params, result, Date.now() - start);

console.log(result.choices[0].message.content);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tagging Prompts</h2>
      <p className="text-gray-700 mb-4">
        Pass a <code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> to group and analyze specific prompts:
      </p>
      <CodeBlock code={`await costlens.trackGrok(
  params,
  result,
  Date.now() - start,
  'customer-support-v2'
);`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Error Handling</h2>
      <CodeBlock code={`const start = Date.now();
try {
  const result = await grok.chat.completions.create(params);
  await costlens.trackGrok(params, result, Date.now() - start);
  return result;
} catch (error) {
  await costlens.trackError(
    'grok',
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
        <li><strong>Grok Beta</strong> - $5 per 1M tokens (input + output)</li>
      </ul>
      <p className="text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <strong>Note:</strong> Pricing shown is approximate. Actual costs calculated based on official xAI pricing at time of API call. Visit <a href="https://x.ai" target="_blank" rel="noopener" className="text-blue-600 hover:underline">x.ai</a> for current rates.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Gets Tracked</h2>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li>Model name (e.g., grok-beta)</li>
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
        <li><strong>Monitor latency</strong> - Track response times</li>
        <li><strong>Set budget alerts</strong> - Get notified before overspending</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Next Steps</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/docs/openai" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">OpenAI Integration</p>
        </Link>
        <Link href="/docs/gemini" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">Gemini Integration</p>
        </Link>
        <Link href="/docs/sdk" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">SDK Reference</p>
        </Link>
      </div>
    </div>
  );
}
