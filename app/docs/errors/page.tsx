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

export default function ErrorsDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Tracking</h1>
      <p className="text-xl text-gray-600 mb-12">
        Track failed API calls to monitor error rates and identify issues.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why Track Errors?</h2>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li>Monitor success rates in your dashboard</li>
        <li>Identify problematic prompts or models</li>
        <li>Get alerted when error rates spike</li>
        <li>Debug issues faster with error logs</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Basic Error Tracking</h2>
      <CodeBlock code={`import OptiRelay from 'optirelay-sdk';

const optirelay = new OptiRelay({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await optirelay.trackOpenAI(params, result, Date.now() - start);
} catch (error) {
  // Track the error
  await optirelay.trackError(
    'openai',
    params.model,
    JSON.stringify(params.messages),
    error,
    Date.now() - start
  );
  throw error; // Re-throw to handle in your app
}`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Gets Tracked</h2>
      <p className="text-gray-700 mb-4">When you track an error, we capture:</p>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li><strong>Model</strong> - Which model failed</li>
        <li><strong>Input</strong> - What was sent to the API</li>
        <li><strong>Error message</strong> - The error details</li>
        <li><strong>Latency</strong> - How long before it failed</li>
        <li><strong>Timestamp</strong> - When it happened</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Common Error Types</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rate Limit Errors</h3>
          <p className="text-gray-700 mb-3">When you exceed API rate limits:</p>
          <CodeBlock code={`Error: Rate limit exceeded
Solution: Implement exponential backoff or upgrade your API plan`} language="text" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Invalid Request Errors</h3>
          <p className="text-gray-700 mb-3">When parameters are incorrect:</p>
          <CodeBlock code={`Error: Invalid model specified
Solution: Check model name spelling and availability`} language="text" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Authentication Errors</h3>
          <p className="text-gray-700 mb-3">When API keys are invalid:</p>
          <CodeBlock code={`Error: Invalid API key
Solution: Verify your API key is correct and active`} language="text" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Viewing Errors in Dashboard</h2>
      <p className="text-gray-700 mb-4">Go to your dashboard to see:</p>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li>Overall success rate percentage</li>
        <li>Error rate trends over time</li>
        <li>Most common error messages</li>
        <li>Which prompts have highest error rates</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Best Practices</h2>
      <ol className="space-y-2 text-gray-700 list-decimal list-inside">
        <li><strong>Always use try/catch</strong> - Never skip error handling</li>
        <li><strong>Track before re-throwing</strong> - Log to OptiRelay then handle in your app</li>
        <li><strong>Include context</strong> - Use promptId to identify problematic prompts</li>
        <li><strong>Set error rate alerts</strong> - Get notified when errors spike</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Error Rate Alerts</h2>
      <p className="text-gray-700 mb-4">Set up alerts in Settings to get notified when:</p>
      <ul className="space-y-2 text-gray-700 list-disc list-inside">
        <li>Error rate exceeds 5%</li>
        <li>Specific prompt has high failure rate</li>
        <li>New error types appear</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Next Steps</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/docs/openai" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">OpenAI Integration</p>
        </Link>
        <Link href="/docs/anthropic" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">Anthropic Integration</p>
        </Link>
        <Link href="/docs/sdk" className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all">
          <p className="font-semibold text-gray-900">SDK Reference</p>
        </Link>
      </div>
    </div>
  );
}
