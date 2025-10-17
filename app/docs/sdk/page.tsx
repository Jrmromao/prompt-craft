'use client';

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

export default function SDKDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">SDK Reference</h1>
      <p className="text-xl text-gray-600 mb-8">
        Complete reference for the CostLens SDK - Save 50-80% on AI costs automatically.
      </p>

      <div className="bg-green-50 border border-green-200 p-4 mb-12 rounded-lg">
        <p className="text-green-900 font-medium mb-1">💰 Money-Saving Features</p>
        <p className="text-green-800 text-sm">
          Redis caching, quality monitoring, AI optimization, and real-time savings tracking
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 mb-12 rounded-lg">
        <p className="text-yellow-900 font-medium mb-1">⚠️ Server-Side Only</p>
        <p className="text-yellow-800 text-sm">
          Caching and optimization require server-side environment (Node.js, Next.js API routes). 
          Browser usage works but skips these features for security.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Installation</h2>
      <CodeBlock code="npm install costlens" language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Constructor</h2>
      <CodeBlock code="new CostLens(config: CostLensConfig)" />

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Parameters</h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Required</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-1 rounded">apiKey</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">string</td>
              <td className="px-4 py-3 text-sm text-gray-600">Yes</td>
              <td className="px-4 py-3 text-sm text-gray-600">Your CostLens API key</td>
            </tr>
            <tr className="bg-green-50">
              <td className="px-4 py-3 text-sm"><code className="bg-green-100 px-2 py-1 rounded">autoOptimize</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">💰 Auto-optimize prompts (50-80% token reduction)</td>
            </tr>
            <tr className="bg-green-50">
              <td className="px-4 py-3 text-sm"><code className="bg-green-100 px-2 py-1 rounded">smartRouting</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">💰 Route to cheapest model (20x savings)</td>
            </tr>
            <tr className="bg-green-50">
              <td className="px-4 py-3 text-sm"><code className="bg-green-100 px-2 py-1 rounded">enableCache</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">💰 Cache responses (80% savings on repeats)</td>
            </tr>
            <tr className="bg-green-50">
              <td className="px-4 py-3 text-sm"><code className="bg-green-100 px-2 py-1 rounded">costLimit</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">number</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">💰 Max cost per request (prevents overruns)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-1 rounded">autoFallback</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">Auto-fallback on rate limits</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-1 rounded">maxRetries</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">number</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">Max retry attempts (default: 3)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-1 rounded">baseUrl</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">string</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">Custom base URL (default: https://costlens.dev)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Example</h3>
      <CodeBlock code={`const costlens = new CostLens({
  apiKey: 'pc_your_api_key_here',
  autoOptimize: true,    // 💰 Save 50-80% on tokens
  smartRouting: true,    // 💰 Route to cheapest model
  enableCache: true,     // 💰 Cache repeated queries
  costLimit: 0.10,       // 💰 Max $0.10 per request
  autoFallback: true,    // Auto-retry on failures
  maxRetries: 3          // Retry up to 3 times
});`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Methods</h2>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">trackOpenAI()</h3>
        <p className="text-gray-700 mb-4">Track an OpenAI API call.</p>
        <CodeBlock code={`trackOpenAI(
  params: OpenAI.Chat.ChatCompletionCreateParams,
  result: OpenAI.Chat.ChatCompletion,
  latency: number,
  promptId?: string
): Promise<void>`} />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">params</code> - The parameters passed to OpenAI</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">result</code> - The response from OpenAI</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">latency</code> - Time taken in milliseconds</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> - Optional tag to group related prompts</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Example</h4>
        <CodeBlock code={`const start = Date.now();
const result = await openai.chat.completions.create(params);
await costlens.trackOpenAI(
  params, 
  result, 
  Date.now() - start,
  'my-prompt-v1' // optional
);`} />
      </div>

      <div className="border-t border-gray-200 pt-8 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">trackAnthropic()</h3>
        <p className="text-gray-700 mb-4">Track an Anthropic (Claude) API call.</p>
        <CodeBlock code={`trackAnthropic(
  params: Anthropic.MessageCreateParams,
  result: Anthropic.Message,
  latency: number,
  promptId?: string
): Promise<void>`} />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">params</code> - The parameters passed to Anthropic</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">result</code> - The response from Anthropic</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">latency</code> - Time taken in milliseconds</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> - Optional tag to group related prompts</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Example</h4>
        <CodeBlock code={`const start = Date.now();
const result = await anthropic.messages.create(params);
await costlens.trackAnthropic(
  params,
  result,
  Date.now() - start,
  'my-prompt-v1' // optional
);`} />
      </div>

      <div className="border-t border-gray-200 pt-8 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">trackGemini()</h3>
        <p className="text-gray-700 mb-4">Track a Google Gemini API call.</p>
        <CodeBlock code={`trackGemini(
  params: any,
  result: any,
  latency: number,
  promptId?: string
): Promise<void>`} />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">params</code> - The parameters passed to Gemini</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">result</code> - The response from Gemini</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">latency</code> - Time taken in milliseconds</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> - Optional tag to group related prompts</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Example</h4>
        <CodeBlock code={`const start = Date.now();
const result = await model.generateContent(params);
await costlens.trackGemini(
  { model: 'gemini-pro', ...params },
  result.response,
  Date.now() - start,
  'my-prompt-v1' // optional
);`} />
      </div>

      <div className="border-t border-gray-200 pt-8 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">trackGrok()</h3>
        <p className="text-gray-700 mb-4">Track an xAI Grok API call.</p>
        <CodeBlock code={`trackGrok(
  params: any,
  result: any,
  latency: number,
  promptId?: string
): Promise<void>`} />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">params</code> - The parameters passed to Grok</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">result</code> - The response from Grok</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">latency</code> - Time taken in milliseconds</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">promptId</code> - Optional tag to group related prompts</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Example</h4>
        <CodeBlock code={`const start = Date.now();
const result = await grok.chat.completions.create(params);
await costlens.trackGrok(
  params,
  result,
  Date.now() - start,
  'my-prompt-v1' // optional
);`} />
      </div>

      <div className="border-t border-gray-200 pt-8 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">trackError()</h3>
        <p className="text-gray-700 mb-4">Track a failed API call.</p>
        <CodeBlock code={`trackError(
  provider: string,
  model: string,
  input: string,
  error: Error,
  latency: number
): Promise<void>`} />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">provider</code> - The provider (openai, anthropic, gemini, grok)</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">model</code> - The model that was attempted</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">input</code> - The input that was sent</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">error</code> - The error object</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">latency</code> - Time taken before failure</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Example</h4>
        <CodeBlock code={`try {
  const result = await openai.chat.completions.create(params);
  await costlens.trackOpenAI(params, result, latency);
} catch (error) {
  await costlens.trackError(
    'openai',
    params.model,
    JSON.stringify(params.messages),
    error,
    latency
  );
  throw error;
}`} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">💰 Money-Saving Features</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Redis Caching</h3>
          <p className="text-gray-700 mb-4">
            Automatically cache responses to save money on repeated requests. Achieves 60-80% hit rates in production.
          </p>
          <CodeBlock code={`const costlens = new CostLens({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  enableCache: true, // Enable Redis caching
});

const tracked = costlens.wrapOpenAI(openai);

// First call - cache miss, costs $0.05
await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
});

// Second call - cache hit, costs $0.00!
await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
});`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Monitoring</h3>
          <p className="text-gray-700 mb-4">
            Smart routing automatically disables if response quality drops below 3.5/5 stars.
          </p>
          <CodeBlock code={`// SDK checks quality status before routing
const tracked = costlens.wrapOpenAI(openai);

// If quality is good: GPT-4 → GPT-3.5 (saves money)
// If quality dropped: Uses GPT-4 (protects quality)
await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Complex task...' }],
});

// Submit feedback to improve routing
await fetch('/api/quality/feedback', {
  method: 'POST',
  body: JSON.stringify({
    runId: 'run_123',
    rating: 5, // 1-5 stars
    feedback: 'Great response!'
  })
});`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Optimization</h3>
          <p className="text-gray-700 mb-4">
            Automatically compress prompts by 30-50% while preserving meaning.
          </p>
          <CodeBlock code={`const costlens = new CostLens({
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  autoOptimize: true, // Enable AI compression
});

const tracked = costlens.wrapOpenAI(openai);

// Original: 200 tokens
// Optimized: 100 tokens (50% reduction)
// Savings: $0.009 per request
await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'user',
    content: 'Please kindly help me understand what the weather will be like tomorrow in San Francisco, California, USA'
  }],
});
// Compressed to: "Weather forecast for San Francisco tomorrow?"
`} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Savings</h3>
          <p className="text-gray-700 mb-4">
            Track exactly how much money you're saving with baseline cost comparison.
          </p>
          <CodeBlock code={`// View savings in dashboard
const response = await fetch('/api/savings?period=today');
const savings = await response.json();

console.log(\`Saved today: $\${savings.totalSaved}\`);
console.log(\`Breakdown:\`);
console.log(\`  Smart Routing: $\${savings.smartRouting}\`);
console.log(\`  Caching: $\${savings.caching}\`);
console.log(\`  Optimization: $\${savings.optimization}\`);
console.log(\`Savings Rate: \${savings.savingsRate}%\`);

// Example output:
// Saved today: $45.67
// Breakdown:
//   Smart Routing: $30.00
//   Caching: $12.50
//   Optimization: $3.17
// Savings Rate: 68%`} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Types</h2>

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">CostLensConfig</h3>
      <CodeBlock code={`interface CostLensConfig {
  apiKey: string;
  baseUrl?: string;
}`} />

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Environment Variables</h2>
      <CodeBlock code={`# .env
PROMPTCRAFT_API_KEY=pc_your_api_key_here
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key`} language="bash" />
    </div>
  );
}
