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

export default function AdvancedFeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Features</h1>
      <p className="text-xl text-gray-600 mb-12">
        Unlock the full power of OptiRelay SDK with caching, middleware, retries, and more.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Smart Caching</h2>
      <p className="text-gray-700 mb-4">
        Reduce API costs by up to 80% by caching identical requests:
      </p>
      <CodeBlock code={`const optirelay = new OptiRelay({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true  // Enable caching globally
});

const tracked = optirelay.wrapOpenAI(openai);

// Cache this specific request for 1 hour
const result = await tracked.chat.completions.create(
  { model: 'gpt-4', messages: [...] },
  { cacheTTL: 3600000 }  // 1 hour in milliseconds
);

// Second identical call returns cached result instantly
const cached = await tracked.chat.completions.create(
  { model: 'gpt-4', messages: [...] },
  { cacheTTL: 3600000 }
);

// Clear cache when needed
optirelay.clearCache();`} />

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 rounded-r">
        <p className="text-sm text-blue-900">
          <strong>💡 Use cases:</strong> FAQ responses, static content generation, repeated queries
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Auto-Retry with Backoff</h2>
      <p className="text-gray-700 mb-4">
        Automatically retry failed requests with exponential backoff:
      </p>
      <CodeBlock code={`const optirelay = new OptiRelay({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  maxRetries: 3  // Retry up to 3 times
});

// Automatically retries on 5xx errors with backoff: 1s, 2s, 4s
const tracked = optirelay.wrapOpenAI(openai);
const result = await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [...]
});
// ✅ Handles transient failures automatically`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Middleware System</h2>
      <p className="text-gray-700 mb-4">
        Add custom logic before/after API calls:
      </p>
      <CodeBlock code={`const optirelay = new OptiRelay({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  middleware: [
    {
      // Run before API call
      before: async (params) => {
        console.log('Making API call with model:', params.model);
        // Modify params if needed
        params.temperature = params.temperature || 0.7;
        return params;
      },
      
      // Run after successful API call
      after: async (result) => {
        console.log('Tokens used:', result.usage?.total_tokens);
        // Transform result if needed
        return result;
      },
      
      // Run on error
      onError: async (error) => {
        console.error('API call failed:', error.message);
        // Send to error tracking service
      }
    }
  ]
});`} />

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Middleware Use Cases</h3>
      <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
        <li><strong>Logging:</strong> Track all API calls to your logging service</li>
        <li><strong>Validation:</strong> Ensure params meet your requirements</li>
        <li><strong>Transformation:</strong> Modify requests/responses</li>
        <li><strong>Monitoring:</strong> Send metrics to DataDog/New Relic</li>
        <li><strong>Rate limiting:</strong> Implement custom rate limits</li>
        <li><strong>A/B testing:</strong> Route requests to different models</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Streaming Support</h2>
      <p className="text-gray-700 mb-4">
        Track streaming responses automatically:
      </p>
      <CodeBlock code={`const tracked = optirelay.wrapOpenAI(openai);

const stream = await tracked.chat.completions.stream({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a long story' }]
});

// Stream chunks to user
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}

// ✅ Automatically tracked after stream completes
// Includes full content and estimated token count`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Batch Tracking</h2>
      <p className="text-gray-700 mb-4">
        Efficiently track multiple calls at once:
      </p>
      <CodeBlock code={`// Track multiple calls in one request
await optirelay.trackBatch([
  { provider: 'openai', model: 'gpt-4', tokens: 100, latency: 500 },
  { provider: 'openai', model: 'gpt-3.5-turbo', tokens: 50, latency: 200 },
  { provider: 'anthropic', model: 'claude-3-opus', tokens: 150, latency: 600 }
]);

// Useful for background jobs or bulk processing`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tagging & Organization</h2>
      <p className="text-gray-700 mb-4">
        Tag prompts to analyze by use case:
      </p>
      <CodeBlock code={`const tracked = optirelay.wrapOpenAI(openai);

// Tag with promptId for analytics
const result = await tracked.chat.completions.create(
  { model: 'gpt-4', messages: [...] },
  { promptId: 'customer-support-v2' }
);

// View analytics grouped by promptId in dashboard
// Compare performance across different prompt versions`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Configuration Reference</h2>
      <CodeBlock code={`interface OptiRelayConfig {
  apiKey: string;           // Required: Your API key
  baseUrl?: string;         // Optional: Custom endpoint
  enableCache?: boolean;    // Optional: Enable caching (default: false)
  maxRetries?: number;      // Optional: Max retry attempts (default: 3)
  middleware?: Middleware[]; // Optional: Custom middleware
}

interface Middleware {
  before?: (params: any) => Promise<any>;
  after?: (result: any) => Promise<any>;
  onError?: (error: Error) => Promise<void>;
}`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Best Practices</h2>
      <ol className="space-y-3 text-gray-700 list-decimal list-inside">
        <li><strong>Use wrappers</strong> - Simplest and most reliable approach</li>
        <li><strong>Enable caching</strong> - For repeated queries (FAQs, static content)</li>
        <li><strong>Set maxRetries</strong> - Improve reliability for production</li>
        <li><strong>Use middleware</strong> - For logging, monitoring, validation</li>
        <li><strong>Tag prompts</strong> - Analyze performance by use case</li>
        <li><strong>Monitor costs</strong> - Set budget alerts in dashboard</li>
      </ol>

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
