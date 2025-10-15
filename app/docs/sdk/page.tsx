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
      <p className="text-xl text-gray-600 mb-12">
        Complete reference for the PromptCraft SDK.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Installation</h2>
      <CodeBlock code="npm install promptcraft-sdk" language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Constructor</h2>
      <CodeBlock code="new PromptCraft(config: PromptCraftConfig)" />

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
              <td className="px-4 py-3 text-sm text-gray-600">Your PromptCraft API key</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-1 rounded">baseUrl</code></td>
              <td className="px-4 py-3 text-sm text-gray-600">string</td>
              <td className="px-4 py-3 text-sm text-gray-600">No</td>
              <td className="px-4 py-3 text-sm text-gray-600">Custom base URL (default: https://promptcraft.app)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Example</h3>
      <CodeBlock code={`const promptcraft = new PromptCraft({
  apiKey: 'pc_your_api_key_here',
  baseUrl: 'https://custom.promptcraft.app' // optional
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
await promptcraft.trackOpenAI(
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
await promptcraft.trackAnthropic(
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
  model: string,
  input: string,
  error: Error,
  latency: number
): Promise<void>`} />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">model</code> - The model that was attempted</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">input</code> - The input that was sent</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">error</code> - The error object</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">latency</code> - Time taken before failure</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Example</h4>
        <CodeBlock code={`try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, latency);
} catch (error) {
  await promptcraft.trackError(
    params.model,
    JSON.stringify(params.messages),
    error,
    latency
  );
  throw error;
}`} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Types</h2>

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">PromptCraftConfig</h3>
      <CodeBlock code={`interface PromptCraftConfig {
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
